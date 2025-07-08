// import express from "express";
// import { addTeacher } from "../controllers/teacher.controller.js";

// const router = express.Router();

// router.post("/", addTeacher);

// export default router;


import express from 'express';
import multer from 'multer';
import { addTeacher, getTeacherById, getTeachers, updateTeacher } from '../controllers/teacher.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

const teacherUploads = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'medical_form', maxCount: 1 },
  { name: 'credentials', maxCount: 1 },
  { name: 'cbc_worksheet', maxCount: 1 },
  { name: 'auth_affirmation_form', maxCount: 1 },
  { name: 'mandated_reporter_cert', maxCount: 1 },
  { name: 'preventing_sids_cert', maxCount: 1 }
]);

router.post(
  '/',
//   verifyToken,
  teacherUploads, 
  addTeacher
);


router.get( "/", getTeachers);

router.get( "/:id", getTeacherById);

router.patch(
  "/:id",
//   verifyToken,
  teacherUploads,
  updateTeacher
);



export default router;
