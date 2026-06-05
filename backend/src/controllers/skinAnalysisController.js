import axios from 'axios';
import { Task } from '../models/Task.js';
import { SkinAnalysisResult } from '../models/SkinAnalysisResult.js';
import { PerfectCorpService } from '../services/perfectCorpService.js';
import { CloudinaryService } from '../services/cloudinaryService.js';
import { WavespeedService } from '../services/wavespeedService.js';
import { extractZipFromUrl } from '../utils/zipExtractor.js';

// PerfectCorp HD skin analysis requires the short side to be >= 1080px. We upscale crops
// below this (with margin) via Wavespeed before sending.
const MIN_DIMENSION = 1200;

// Below this native face width, even a 2k Wavespeed upscale is mostly fabricated detail and
// would yield unreliable skin scores — reject up front instead of wasting an upscale call.
const MIN_FACE_WIDTH = 200;

// PerfectCorp requires the (real) face width to be > 60% of the image width, else it returns
// error_src_face_too_small. Cloudinary's detected face box is WIDER than PerfectCorp's notion
// of face width (it includes hair/ears), so we must aim higher: empirically a Cloudinary
// face-box width of 70% of the crop still fails, while 80%+ passes. We target 85% for margin
// while leaving enough head room (90% also passes, so 85% is a safe middle).
const TARGET_FACE_WIDTH_RATIO = 0.85;
// Portrait crop height as a multiple of width — room for hairline-to-chin plus margin.
const CROP_ASPECT = 1.4;

/**
 * Pre-flight analysis from Cloudinary's detected faces — decides, BEFORE any Wavespeed or
 * PerfectCorp call, whether the photo is usable and whether it needs upscaling. Cloudinary's
 * `faces` ([x,y,w,h]) gives the exact native face size for free, so no vision API is needed.
 *
 * Returns either { error } to reject the photo, or a crop plan:
 *   { box, strategy, needsUpscale, faceWidth, cropWidth, reason }
 * The box is a centered, portrait crop where the detected face fills ~TARGET_FACE_WIDTH_RATIO
 * of the width (so PerfectCorp's narrower face measurement clears its >60% rule).
 */
const planFaceCrop = (faces, imgW, imgH) => {
  const usable = Array.isArray(faces)
    ? faces.filter((f) => Array.isArray(f) && f[2] >= 1 && f[3] >= 1)
    : [];

  if (usable.length === 0) {
    return { error: 'No face detected. Please use a clear, front-facing photo of your face.' };
  }

  const [x, y, w, h] = usable.reduce((a, b) => (b[2] * b[3] > a[2] * a[3] ? b : a));

  if (w < MIN_FACE_WIDTH) {
    return { error: 'Your face is too small or far away. Please use a closer, higher-resolution photo.' };
  }

  // Crop dimensions from the target face-width ratio, clamped to the image.
  const cw = Math.min(Math.round(w / TARGET_FACE_WIDTH_RATIO), imgW);
  const ch = Math.min(Math.round(cw * CROP_ASPECT), imgH);

  const cx = x + w / 2;
  const cy = y + h / 2;
  // Center on the face horizontally; vertically bias up a little so the forehead/hair is kept.
  let nx = Math.round(cx - cw / 2);
  let ny = Math.round(cy - ch / 2 - h * 0.1);
  nx = Math.max(0, Math.min(nx, imgW - cw));
  ny = Math.max(0, Math.min(ny, imgH - ch));

  const box = { x: nx, y: ny, w: cw, h: ch };
  const needsUpscale = box.w < MIN_DIMENSION || box.h < MIN_DIMENSION;

  return {
    box,
    strategy: usable.length > 1 ? 'largest_face' : 'face',
    needsUpscale,
    faceWidth: w,
    cropWidth: box.w,
    reason: `face ${w}px → crop ${box.w}px ${needsUpscale ? '<' : '≥'} ${MIN_DIMENSION}px min`,
  };
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file && !req.body.imageUrl) {
      return res.status(400).json({ error: 'No image provided' });
    }

    let imageUrl;     // Original image, kept for history/display
    let publicId;     // Cloudinary public_id, used to derive the face crop
    let faces;        // Detected face boxes ([x,y,w,h]) from Cloudinary
    let imgW;         // Original image dimensions (for crop math + threshold)
    let imgH;

    if (req.file) {
      // Upload file buffer to Cloudinary for history/display + face detection
      const result = await CloudinaryService.uploadImage(req.file.buffer);
      imageUrl = result.secure_url;
      publicId = result.public_id;
      faces = result.faces;
      imgW = result.width;
      imgH = result.height;
    } else {
      // Provided URL — store it on Cloudinary so we can derive a face crop from it too
      const srcUrl = req.body.imageUrl;
      if (!srcUrl || !srcUrl.startsWith('http')) {
        return res.status(400).json({ error: 'Invalid image URL' });
      }
      const result = await CloudinaryService.uploadFromUrl(srcUrl);
      imageUrl = result.secure_url;
      publicId = result.public_id;
      faces = result.faces;
      imgW = result.width;
      imgH = result.height;
    }

    // Pre-flight: decide from Cloudinary's free face data whether the photo is usable and
    // whether upscaling is needed — BEFORE spending a Wavespeed or PerfectCorp call.
    const plan = planFaceCrop(faces, imgW, imgH);
    if (plan.error) {
      console.log(`[SkinAnalysis] Rejected (${imgW}x${imgH}): ${plan.error}`);
      // Drop the just-uploaded original; there's no task/history record for a rejected photo.
      CloudinaryService.deleteImage(publicId).catch((e) =>
        console.error('[SkinAnalysis] Failed to clean up rejected upload:', e.message)
      );
      return res.status(400).json({ error: plan.error });
    }

    // Frame the face so it fills the frame the way PerfectCorp requires (face width > 60%;
    // see TARGET_FACE_WIDTH_RATIO), then upscale via Wavespeed when the native crop is below
    // PerfectCorp's HD short-side minimum. The framed crop is sent to PerfectCorp as-is —
    // upscaling preserves the framing, so no second crop is needed.
    const { box, strategy: cropStrategy, needsUpscale, faceWidth, cropWidth, reason } = plan;
    const nativeCropUrl = CloudinaryService.buildNativeFaceCropUrl(publicId, box);
    console.log(`[SkinAnalysis] original ${imgW}x${imgH}, strategy=${cropStrategy}, ${reason}`);

    let finalImageUrl = nativeCropUrl;
    let upscaled = false;
    let upscaledImageUrl = null;
    let wavespeedRequestId = null;
    let upscaleError = null;

    if (needsUpscale) {
      try {
        const { requestId, outputUrl } = await WavespeedService.upscaleAndWait(nativeCropUrl, {
          targetResolution: '2k',
          outputFormat: 'jpeg',
        });
        wavespeedRequestId = requestId;
        // Persist our own copy — Wavespeed deletes outputs after 7 days — and send that.
        const reupload = await CloudinaryService.uploadFromUrl(outputUrl);
        upscaledImageUrl = reupload.secure_url;
        finalImageUrl = upscaledImageUrl;
        upscaled = true;
        console.log(`[SkinAnalysis] upscaled to ${reupload.width}x${reupload.height}`);
      } catch (err) {
        upscaleError = err.message;
        console.error('[SkinAnalysis] Wavespeed upscale failed, sending native crop:', upscaleError);
      }
    }
    console.log('[SkinAnalysis] final image for PerfectCorp:', finalImageUrl);

    // Fetch the chosen image as raw bytes for the Perfect Corp v2.1 File API upload.
    let imageBuffer;
    let fileMeta;
    try {
      const fetched = await axios.get(finalImageUrl, { responseType: 'arraybuffer' });
      imageBuffer = Buffer.from(fetched.data);
      fileMeta = {
        contentType: fetched.headers['content-type'] || 'image/jpeg',
        fileName: 'selfie.jpg',
        fileSize: imageBuffer.length,
      };
    } catch (fetchError) {
      console.error('[SkinAnalysis] Failed to fetch processed image:', fetchError.message);
      return res.status(500).json({ error: 'Failed to process image' });
    }

    // Get selected skin concerns from request body
    let dstActions = null;
    if (req.body.dstActions) {
      try {
        // Parse if it's a JSON string
        dstActions = typeof req.body.dstActions === 'string'
          ? JSON.parse(req.body.dstActions)
          : req.body.dstActions;
      } catch (e) {
        console.error('Error parsing dstActions:', e);
      }
    }

    // Start Perfect Corp task
    const { taskId } = await PerfectCorpService.startSkinAnalysis(imageBuffer, fileMeta, dstActions);

    // Create task record
    const task = await Task.create({
      user_id: req.user.id,
      task_type: 'skin_analysis',
      task_id: taskId,
      status: 'pending',
      metadata: {
        image_url: imageUrl,
        public_id: publicId,
        original_dims: { width: imgW, height: imgH },
        crop_strategy: cropStrategy,
        face_crop: box,
        face_width: faceWidth,
        crop_width: cropWidth,
        decision_reason: reason,
        final_image_url: finalImageUrl,
        upscaled,
        upscaled_image_url: upscaledImageUrl,
        wavespeed_request_id: wavespeedRequestId,
        upscale_error: upscaleError,
      },
    });

    // Poll for results in background
    pollSkinAnalysisTask(taskId, task.id, req.user.id, imageUrl);

    res.json({
      taskId,
      status: 'pending',
      message: 'Analysis started',
      imageUrl, // Return imageUrl for use in other features
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: error.message || 'Failed to start analysis' });
  }
};

const pollSkinAnalysisTask = async (perfectCorpTaskId, dbTaskId, userId, imageUrl) => {
  try {
    const result = await PerfectCorpService.pollSkinAnalysis(perfectCorpTaskId);
    
    const resultData = result?.data?.results;
    const resultUrl = resultData?.url; // May be null for JSON format
    const output = resultData?.output || [];
    
    // Extract mask URLs and scores from the output array (JSON format)
    let maskUrls = {};
    let scores = {};
    let originalImageUrl = null;
    
    if (Array.isArray(output) && output.length > 0) {
      // Process each output item
      output.forEach((item) => {
        const type = item.type;
        
        // Extract scores
        if (item.ui_score !== undefined) {
          scores[type] = {
            ui_score: item.ui_score,
            raw_score: item.raw_score,
          };
        } else if (item.score !== undefined) {
          scores[type] = {
            score: item.score,
          };
        }
        
        // Extract mask URLs (these are the overlay images)
        if (item.mask_urls && Array.isArray(item.mask_urls) && item.mask_urls.length > 0) {
          maskUrls[type] = item.mask_urls[0]; // Use first mask URL
        }
        
        // Extract original/resized image URL
        if (type === 'resize_image' && item.mask_urls && item.mask_urls.length > 0) {
          originalImageUrl = item.mask_urls[0];
        }
      });
      
      console.log('Extracted mask URLs for types:', Object.keys(maskUrls));
      console.log('Extracted scores for types:', Object.keys(scores));
      console.log('Original image URL:', originalImageUrl);
    }
    
    // Fallback: Try to extract from ZIP if resultUrl is a ZIP file (legacy format)
    if (resultUrl && resultUrl.endsWith('.zip') && Object.keys(maskUrls).length === 0) {
      try {
        const zipFiles = await extractZipFromUrl(resultUrl);
        console.log('ZIP files found:', Object.keys(zipFiles));
        
        // Try to find score_info.json in ZIP
        const possiblePaths = [
          'score_info.json',
          'skinanalysisResult/score_info.json',
          'skinanalysisResult\\score_info.json',
        ];
        
        for (const path of possiblePaths) {
          if (zipFiles[path]) {
            const zipScores = JSON.parse(zipFiles[path]);
            scores = { ...scores, ...zipScores };
            console.log(`Found score_info.json at: ${path}`);
            break;
          }
        }
      } catch (zipError) {
        console.error('Error extracting ZIP:', zipError);
      }
    }
    
    await Task.updateStatus(perfectCorpTaskId, 'success', resultUrl, {
      zip_url: resultUrl, // May be null for JSON format
      scores,
      mask_urls: maskUrls,
      original_image_url: originalImageUrl,
      output: output, // Store full output for reference
    });

    // Create skin analysis result - always create even if scores are empty
    try {
      const analysisResult = await SkinAnalysisResult.create({
        user_id: userId,
        task_id: dbTaskId,
        image_url: imageUrl,
        scores: scores || {}, // Ensure scores is always an object
      });
      console.log(`[SkinAnalysis] Created result record with ID: ${analysisResult.id}, scores count: ${Object.keys(scores || {}).length}`);
    } catch (createError) {
      console.error('[SkinAnalysis] Error creating result record:', createError);
      // Don't throw - the task is already updated, we just log the error
    }
  } catch (error) {
    console.error('[SkinAnalysis] Polling error:', error);
    const msg = error?.message || String(error);
    let errorCode = null;
    try {
      const jsonMatch = msg.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        errorCode = parsed?.data?.error ?? parsed?.error ?? null;
      }
    } catch {
      /* ignore parse errors */
    }

    let prevMeta = {};
    try {
      const taskRow = await Task.findByTaskId(perfectCorpTaskId);
      if (taskRow?.metadata) {
        prevMeta =
          typeof taskRow.metadata === 'string'
            ? JSON.parse(taskRow.metadata)
            : taskRow.metadata;
      }
    } catch {
      /* ignore */
    }

    await Task.updateStatus(perfectCorpTaskId, 'error', null, {
      ...prevMeta,
      error: msg,
      error_code: errorCode,
    });
  }
};

export const getTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByTaskId(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Parse metadata if it's a string
    let metadata = task.metadata;
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch (e) {
        metadata = {};
      }
    }

    // Try to get scores from SkinAnalysisResult table
    let scores = metadata?.scores || {};
    let maskUrls = metadata?.mask_urls || {};
    let output = metadata?.output || [];
    
    try {
      const skinResult = await SkinAnalysisResult.findByTaskId(task.id);
      if (skinResult && skinResult.scores) {
        if (typeof skinResult.scores === 'string') {
          try {
            scores = JSON.parse(skinResult.scores);
          } catch (e) {
            // Keep existing scores if parsing fails
          }
        } else {
          scores = skinResult.scores;
        }
      }
    } catch (e) {
      console.error('Error fetching skin result:', e);
      // Continue with metadata scores
    }

    res.json({
      taskId: task.task_id,
      status: task.status,
      resultUrl: task.result_url,
      metadata: metadata || {},
      scores: scores,
      maskUrls: maskUrls,
      originalImageUrl: metadata?.original_image_url || null,
      output: output,
      createdAt: task.created_at,
      errorCode: metadata?.error_code ?? null,
      errorDetail: metadata?.error ?? null,
    });
  } catch (error) {
    console.error('Get task status error:', error);
    res.status(500).json({ error: 'Failed to get task status' });
  }
};

export const getHistory = async (req, res) => {
  try {
    console.log(`[SkinAnalysis] Fetching history for user ID: ${req.user.id}`);
    const results = await SkinAnalysisResult.findByUserId(req.user.id);
    console.log(`[SkinAnalysis] Found ${results.length} result(s) in database`);
    
    // Parse scores and enrich with task metadata
    const parsedResults = await Promise.all(results.map(async (result) => {
      // Parse scores if they're stored as strings
      let scores = result.scores;
      if (scores && typeof scores === 'string') {
        try {
          scores = JSON.parse(scores);
        } catch (e) {
          scores = {};
        }
      }
      
      // Get task metadata for maskUrls, originalImageUrl, etc.
      let taskMetadata = {};
      let maskUrls = {};
      let originalImageUrl = null;
      let resultUrl = null;
      let taskId = null;
      
      if (result.task_id) {
        try {
          const task = await Task.findById(result.task_id);
          if (task) {
            taskId = task.task_id;
            resultUrl = task.result_url;
            
            // Parse task metadata
            if (task.metadata) {
              if (typeof task.metadata === 'string') {
                try {
                  taskMetadata = JSON.parse(task.metadata);
                } catch (e) {
                  taskMetadata = {};
                }
              } else {
                taskMetadata = task.metadata;
              }
              
              // Extract maskUrls and originalImageUrl from metadata
              maskUrls = taskMetadata.mask_urls || {};
              originalImageUrl = taskMetadata.original_image_url || null;
            }
          }
        } catch (e) {
          console.error('Error fetching task metadata:', e);
        }
      }
      
      return {
        id: result.id,
        user_id: result.user_id,
        task_id: taskId || result.task_id,
        image_url: result.image_url,
        scores: scores || {},
        maskUrls: maskUrls,
        originalImageUrl: originalImageUrl,
        resultUrl: resultUrl,
        createdAt: result.task_created_at || result.created_at,
        metadata: taskMetadata,
      };
    }));
    
    console.log(`[SkinAnalysis] Returning ${parsedResults.length} parsed result(s)`);
    res.json(parsedResults);
  } catch (error) {
    console.error('[SkinAnalysis] Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
};

export const getResultDetails = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByTaskId(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get the skin analysis result
    const skinResult = await SkinAnalysisResult.findByTaskId(task.id);
    
    // Parse metadata if it's a string
    let metadata = task.metadata;
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch (e) {
        metadata = {};
      }
    }

    // Parse scores from skin result if available
    let scores = metadata?.scores || {};
    if (skinResult && skinResult.scores) {
      if (typeof skinResult.scores === 'string') {
        try {
          scores = JSON.parse(skinResult.scores);
        } catch (e) {
          scores = {};
        }
      } else {
        scores = skinResult.scores;
      }
    }

    res.json({
      taskId: task.task_id,
      status: task.status,
      resultUrl: task.result_url,
      scores,
      metadata,
      createdAt: task.created_at,
    });
  } catch (error) {
    console.error('Get result details error:', error);
    res.status(500).json({ error: 'Failed to get result details' });
  }
};

