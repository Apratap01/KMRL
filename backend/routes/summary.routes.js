import { Router } from 'express';
import multer from 'multer';
import { summarizeDocument } from '../controllers/summaryController.js';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/:id', upload.single('file'), summarizeDocument);

export default router;

