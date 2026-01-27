import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { applyMakeup, getTaskStatus } from '../controllers/makeupVTOController.js';

const router = express.Router();

router.post('/apply', authenticate, applyMakeup);
router.get('/:taskId', authenticate, getTaskStatus);

export default router;

