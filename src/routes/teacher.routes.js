// import express from "express";
// import { addTeacher } from "../controllers/teacher.controller.js";

// const router = express.Router();

// router.post("/", addTeacher);

// export default router;


import express from 'express';
import multer from 'multer';
import {
  addTeacher,
  getTeacherById,
  getTeachers,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacher.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Setup multer to upload files to local 'uploads/' folder
const upload = multer({ dest: 'uploads/' });

// Define accepted file fields (names must match frontend form)
const courseFields = Array.from({ length: 10 }).map((_, i) => ({
  name: `courses[${i}][certificate]`,
  maxCount: 1
}));

const teacherUploads = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'medical_form', maxCount: 1 },
  { name: 'credentials', maxCount: 1 },
  { name: 'cbc_worksheet', maxCount: 1 },
  { name: 'auth_affirmation_form', maxCount: 1 },
  { name: 'mandated_reporter_cert', maxCount: 1 },
  { name: 'preventing_sids_cert', maxCount: 1 },
  { name: 'courses[0][certificate]', maxCount: 1 },
  { name: 'courses[1][certificate]', maxCount: 1 },
  { name: 'courses[2][certificate]', maxCount: 1 },
  // ...add more if needed
]);

// POST /api/teachers → Add teacher
router.post(
  '/',
  // verifyToken, // ✅ Enable this once token-based auth is needed
  teacherUploads,
  addTeacher
);

router.get("/", getTeachers);

router.get("/:id", getTeacherById);

router.patch(
  "/:id",
  //   verifyToken,
  teacherUploads,
  updateTeacher
);
router.delete('/:id', deleteTeacher);



export default router;
