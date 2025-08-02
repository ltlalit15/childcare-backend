import express from 'express';
import multer from 'multer';
import {
  createMedicalForm,
  getAllMedicalForms,
  getMedicalFormById,
  getMedicalFormsByUserId,
  updateMedicalForm,
  deleteMedicalForm,
  updateFormStatus
} from '../controllers/medicalForm.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

// POST /api/medical-forms - Create new medical form
router.post(
  '/',
  // verifyToken, // Enable when authentication is needed
  upload.array('documents', 10), // Allow up to 10 documents
  createMedicalForm
);

// GET /api/medical-forms - Get all medical forms (admin)
router.get('/', getAllMedicalForms);

// GET /api/medical-forms/:id - Get specific medical form
router.get('/:id', getMedicalFormById);

// GET /api/medical-forms/user/:user_id - Get medical forms by user
router.get('/user/:user_id', getMedicalFormsByUserId);

// PUT /api/medical-forms/:id - Update medical form
router.put(
  '/:id',
  // verifyToken,
  upload.array('documents', 10),
  updateMedicalForm
);

// DELETE /api/medical-forms/:id - Delete medical form (soft delete)
router.delete('/:id', deleteMedicalForm);

// PATCH /api/medical-forms/:id/status - Update form status (admin)
router.patch('/:id/status', updateFormStatus);

export default router; 