import multer from 'multer';

// Memory storage to process documents securely in memory without persistent plain-text disk leaks
const storage = multer.memoryStorage();

export const uploadPdf = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. ClauseRadar only accepts standard PDF documents.'));
    }
  },
});
