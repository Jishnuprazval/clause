import { Router } from 'express';
import {
  uploadContract,
  analyzeTextContract,
  loadSampleContract,
  getContracts,
  getContractById,
  deleteContract,
} from '../controllers/contractController';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware';
import { uploadPdf } from '../middleware/uploadMiddleware';

const router = Router();

router.post('/upload', requireAuth as any, uploadPdf.single('contractFile'), uploadContract as any);
router.post('/analyze-text', requireAuth as any, analyzeTextContract as any);
router.post('/sample', optionalAuth as any, loadSampleContract as any);
router.get('/', requireAuth as any, getContracts as any);
router.get('/:id', requireAuth as any, getContractById as any);
router.delete('/:id', requireAuth as any, deleteContract as any);

export default router;
