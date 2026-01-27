import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { CloudinaryService } from '../services/cloudinaryService.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Upload image to Cloudinary and return the URL
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    console.log('[Upload] Request received');
    console.log('[Upload] Content-Type:', req.headers['content-type']);
    console.log('[Upload] File present:', !!req.file);
    console.log('[Upload] Body keys:', Object.keys(req.body));
    
    if (!req.file) {
      console.log('[Upload] No file found in request');
      return res.status(400).json({ error: 'No image provided. Make sure the field name is "image"' });
    }

    console.log('[Upload] File details:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
    
    console.log('[Upload] Uploading image to Cloudinary...');
    
    // Upload file buffer to Cloudinary
    const result = await CloudinaryService.uploadImage(req.file.buffer, 'aimakeup/uploads');
    
    console.log('[Upload] Image uploaded successfully:', result.secure_url);

    res.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('[Upload] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
});

export default router;
