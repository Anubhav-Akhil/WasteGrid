import express from 'express';
import { getBins, getBinById, createBin, updateBin, deleteBin } from '../controllers/binController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getBins)
  .post(protect, admin, createBin);

router.route('/:id')
  .get(getBinById)
  .put(protect, updateBin)
  .delete(protect, admin, deleteBin);

export default router;
