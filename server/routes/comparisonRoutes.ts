import { Router } from 'express';
import { createComparison, getComparisonById } from '../controllers/comparisonController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/', requireAuth as any, createComparison as any);
router.get('/:id', requireAuth as any, getComparisonById as any);

export default router;
