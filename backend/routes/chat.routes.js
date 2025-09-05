import { Router } from 'express';
import multer from 'multer';
import { getConvId } from '../controllers/chunk.controller.js';
import { realtimeChat } from '../controllers/chat.controller.js';

export const router = Router();
const upload = multer({ dest: 'chunks/' });

router.post('/chunk/:id', upload.single('file'), getConvId)

router.post('/:chunkId/:docId',realtimeChat)