import express from 'express';
import { 
  getAnalytics, 
  createOverflowReport, 
  getOverflowReports, 
  updateOverflowReport 
} from '../controllers/reportController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/analytics', protect, admin, getAnalytics);
router.post('/overflow', protect, createOverflowReport);
router.get('/overflow', protect, getOverflowReports);
router.put('/overflow/:id', protect, admin, updateOverflowReport);

export default router;
