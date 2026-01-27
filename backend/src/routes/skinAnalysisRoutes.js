import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { uploadImage, getTaskStatus, getHistory } from '../controllers/skinAnalysisController.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

router.post('/upload', authenticate, upload.single('image'), uploadImage);
router.get('/:taskId', authenticate, getTaskStatus);
router.get('/history', authenticate, getHistory);

export default router;

