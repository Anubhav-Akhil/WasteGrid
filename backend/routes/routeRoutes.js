import express from 'express';
import { getRoutes, optimizeRoute, collectBin, completeRoute } from '../controllers/routeController.js';
import { protect, admin, driver } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getRoutes);

router.post('/optimize', protect, admin, optimizeRoute);
router.put('/:id/collect/:binId', protect, driver, collectBin);
router.put('/:id/complete', protect, driver, completeRoute);

export default router;
