import express from 'express';
import {
  addCourse,
  getCoursesByUser
} from '../controllers/course.controller.js';

// import { verifyToken } from '../middleware/auth.middleware.js';
// import { authorizeRoles } from '../middleware/role.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

router.post(
  "/",
//   verifyToken,
//   authorizeRoles("Admin", "Secretary"),
  upload.single("certificate"),
  addCourse
);

router.get(
  "/:user_id",
//   verifyToken,
//   authorizeRoles("Admin", "Secretary", "Teacher"),
  getCoursesByUser
);

export default router;
