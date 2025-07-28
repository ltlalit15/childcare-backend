import express from 'express';
import multer from 'multer';
import {
  addTeacher,
  getTeacherById,
  getTeachers,
  updateTeacher,
  deleteTeacher,
  updateSSN,
} from '../controllers/teacher.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Setup multer to upload files to local 'uploads/' folder
const upload = multer({ dest: 'uploads/' });

// Allow any fields (dynamic ones like courses[n][certificate])
const teacherUploads = upload.any();

// POST /api/teachers → Add teacher
router.post(
  '/',
  // verifyToken, // Enable this once token-based auth is needed
  teacherUploads,
  addTeacher
);

// GET /api/teachers → List all teachers
router.get("/", getTeachers);

// GET /api/teachers/:id → Get teacher by ID
router.get("/:id", getTeacherById);

router.patch('/:id/ssn', updateSSN);

// PATCH /api/teachers/:id → Update teacher
router.patch(
  "/:id",
  // verifyToken,
  teacherUploads,
  updateTeacher
);

// DELETE /api/teachers/:id → Delete teacher
router.delete('/:id', deleteTeacher);

export default router;

