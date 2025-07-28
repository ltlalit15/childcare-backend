// routes/childRoutes.js
import express from 'express';
import multer from 'multer';
import {
  addChild,
  getChild,
  updateChild,
  getAllChildren,
  deleteChild,
  getChildrenByTeacherOrClassroom
} from '../controllers/child.controller.js';
// import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
    }
  }
});

const childUploads = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'auth_affirmation_form', maxCount: 1 },
  { name: 'immunization_record', maxCount: 1 },
  { name: 'medical_form', maxCount: 1 },
  { name: 'lunch_form', maxCount: 1 },
  { name: 'agreement_docs', maxCount: 1 },
  { name: 'special_needs_app', maxCount: 1 }
]);

// POST - Add Child
router.post(
  "/add-child",
  // verifyToken,
  // authorizeRoles("Admin", "Secretary"),
  childUploads,
  addChild
);

// GET - Single Child
router.get(
  "/:child_id",
  // verifyToken,
  // authorizeRoles("Admin", "Secretary", "Teacher"),
  getChild
);

// GET - All Children
router.get(
  "/",
  // verifyToken,
  // authorizeRoles("Admin", "Secretary", "Teacher"),
  getAllChildren
);

// PATCH - Update Child
router.patch(
  "/:child_id",
  // verifyToken,
  // authorizeRoles("Admin", "Secretary"),
  childUploads,
  updateChild
);

router.get('/children/by-filter', getChildrenByTeacherOrClassroom);

// Multer error handler
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: 'File upload error: ' + error.message });
  }
  if (error.message === 'Invalid file type. Only images and PDFs are allowed.') {
    return res.status(400).json({ message: error.message });
  }
  next(error);
});

// DELETE - Soft Delete Child
router.delete(
  "/:child_id",
  // verifyToken,
  // authorizeRoles("Admin", "Secretary"),
  deleteChild
);
export default router;