import express from 'express';
import {
    addSignInEntry,
    getAllSignInEntries,
    getSignInEntryById,
    updateSignInEntry,
    deleteSignInEntry
} from '../controllers/sign-in.controller.js';
import { verifyUser } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/add', addSignInEntry);
router.get('/get', verifyUser, getAllSignInEntries);
router.get('/:id', getSignInEntryById);
router.put('/:id', updateSignInEntry);
router.delete('/:id', deleteSignInEntry);

export default router;
