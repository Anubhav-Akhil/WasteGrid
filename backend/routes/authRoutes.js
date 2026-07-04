import express from 'express';
import { registerUser, authUser, getUserProfile, getDrivers } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/me', protect, getUserProfile);
router.get('/drivers', protect, admin, getDrivers);

export default router;
