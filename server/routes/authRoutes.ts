import { Router } from 'express';
import { register, login, getMe, forgotPassword, resetPassword } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth as any, getMe as any);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
