import { Router } from 'express';
import multer from 'multer';
import { regenerateSummary, summarizeDocument } from '../controllers/summaryController.js';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/:id', upload.single('file'), summarizeDocument);
router.post('/regenerate/:id',upload.single("file"),regenerateSummary)

export default router;

