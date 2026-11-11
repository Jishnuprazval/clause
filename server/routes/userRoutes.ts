import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/userController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/profile', requireAuth as any, getProfile as any);
router.put('/profile', requireAuth as any, updateProfile as any);
router.put('/change-password', requireAuth as any, changePassword as any);

export default router;
