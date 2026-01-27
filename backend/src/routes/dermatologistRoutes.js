import express from 'express';
import { searchDermatologistsByZipcode } from '../controllers/dermatologistController.js';

const router = express.Router();

// Public endpoint - no authentication required for searching dermatologists
router.get('/search', searchDermatologistsByZipcode);

export default router;
