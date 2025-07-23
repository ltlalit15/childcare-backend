import express from 'express';

import upload from '../middleware/upload.middleware.js';
import { getDocuments, uploadDocument } from '../controllers/document.controller.js';

const router = express.Router();

router.get('/', getDocuments);

router.post('/upload', upload.single('document_file'), uploadDocument);


export default router;
