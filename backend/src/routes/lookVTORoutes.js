import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { applyLook, getTaskStatus, getTemplates } from '../controllers/lookVTOController.js';

const router = express.Router();

router.get('/templates', authenticate, getTemplates);
router.post('/apply', authenticate, applyLook);
router.get('/:taskId', authenticate, getTaskStatus);

export default router;

