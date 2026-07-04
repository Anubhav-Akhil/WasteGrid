import express from 'express';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicleController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getVehicles)
  .post(protect, admin, createVehicle);

router.route('/:id')
  .put(protect, updateVehicle)
  .delete(protect, admin, deleteVehicle);

export default router;
