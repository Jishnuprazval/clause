import { Router } from 'express';
import {
  reanalyzeContract,
  getAnalysisById,
  getAnalysisHistory,
  getDashboardStats,
} from '../controllers/analysisController';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/dashboard', requireAuth as any, getDashboardStats as any);
router.get('/history', requireAuth as any, getAnalysisHistory as any);
router.get('/details/:analysisId', optionalAuth as any, getAnalysisById as any);
router.post('/:contractId', requireAuth as any, reanalyzeContract as any);

export default router;
