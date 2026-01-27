import { Task } from '../models/Task.js';
import { PerfectCorpService } from '../services/perfectCorpService.js';

export const applyLook = async (req, res) => {
  try {
    const { imageUrl, templateId } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL required' });
    }

    // Start Perfect Corp task
    const { taskId } = await PerfectCorpService.startLookVTO(imageUrl, templateId);

    // Create task record
    const task = await Task.create({
      user_id: req.user.id,
      task_type: 'look_vto',
      task_id: taskId,
      status: 'pending',
      metadata: { image_url: imageUrl, template_id: templateId },
    });

    // Poll for results in background
    pollLookVTOTask(taskId);

    res.json({
      taskId,
      status: 'pending',
      message: 'Look application started',
    });
  } catch (error) {
    console.error('Apply look error:', error);
    res.status(500).json({ error: error.message || 'Failed to apply look' });
  }
};

const pollLookVTOTask = async (perfectCorpTaskId) => {
  try {
    const result = await PerfectCorpService.pollLookVTO(perfectCorpTaskId);
    const resultUrl = result?.data?.results?.url;
    
    if (resultUrl) {
      await Task.updateStatus(perfectCorpTaskId, 'success', resultUrl, {
        result_image_url: resultUrl,
      });
    }
  } catch (error) {
    console.error('Polling error:', error);
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

export const getTemplates = async (req, res) => {
  try {
    const { page_size = 20, starting_token } = req.query;
    
    // Ensure page_size doesn't exceed API limit of 20
    const pageSize = Math.min(parseInt(page_size) || 20, 20);
    
    const result = await PerfectCorpService.getLookTemplates(
      pageSize,
      starting_token || null
    );

    res.json(result);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: error.message || 'Failed to get templates' });
  }
};

