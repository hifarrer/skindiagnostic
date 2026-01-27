import { Task } from '../models/Task.js';
import { PerfectCorpService } from '../services/perfectCorpService.js';
import { CloudinaryService } from '../services/cloudinaryService.js';

export const applyMakeup = async (req, res) => {
  try {
    const { imageUrl, effects } = req.body;

    console.log('[MakeupVTO] Request received:', { imageUrl, effects });

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL required' });
    }

    // Start Perfect Corp task
    const { taskId } = await PerfectCorpService.startMakeupVTO(imageUrl, effects);

    console.log('[MakeupVTO] Task created:', taskId);

    // Create task record
    const task = await Task.create({
      user_id: req.user.id,
      task_type: 'makeup_vto',
      task_id: taskId,
      status: 'pending',
      metadata: { image_url: imageUrl, effects },
    });

    // Poll for results in background
    pollMakeupVTOTask(taskId, imageUrl);

    res.json({
      taskId,
      status: 'pending',
      message: 'Makeup application started',
    });
  } catch (error) {
    console.error('[MakeupVTO] Apply makeup error:', error);
    res.status(500).json({ error: error.message || 'Failed to apply makeup' });
  }
};

const pollMakeupVTOTask = async (perfectCorpTaskId, imageUrl) => {
  try {
    console.log('[MakeupVTO] Starting polling for task:', perfectCorpTaskId);
    const result = await PerfectCorpService.pollMakeupVTO(perfectCorpTaskId);
    
    console.log('[MakeupVTO] Poll result:', JSON.stringify(result, null, 2));
    
    // Try multiple paths for result URL (API response structure may vary)
    const resultUrl = result?.data?.results?.url || 
                      result?.data?.results?.result_url ||
                      result?.data?.result_url ||
                      result?.data?.url;
    
    if (resultUrl) {
      console.log('[MakeupVTO] Got result URL:', resultUrl);
      await Task.updateStatus(perfectCorpTaskId, 'success', resultUrl, {
        result_image_url: resultUrl,
        full_results: result?.data?.results,
      });
    } else {
      console.log('[MakeupVTO] No result URL found in response');
      await Task.updateStatus(perfectCorpTaskId, 'success', null, {
        full_results: result?.data,
      });
    }
  } catch (error) {
    console.error('[MakeupVTO] Polling error:', error);
    await Task.updateStatus(perfectCorpTaskId, 'error', null, { error: error.message });
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

    res.json({
      taskId: task.task_id,
      status: task.status,
      resultUrl: task.result_url,
      metadata: task.metadata,
      createdAt: task.created_at,
    });
  } catch (error) {
    console.error('Get task status error:', error);
    res.status(500).json({ error: 'Failed to get task status' });
  }
};

