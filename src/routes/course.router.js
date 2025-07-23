import express from 'express';
import {
  addCourse,
  deleteCourse,
  getCourses,
  getCoursesByUser,
  updateCourse
} from '../controllers/course.controller.js';

import { verifyToken } from '../middleware/auth.middleware.js';
// import { authorizeRoles } from '../middleware/role.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();
router.post('/', upload.single("certificate_file"), addCourse);

router.patch(
  "/:course_id",
  upload.single("certificate"),
  updateCourse
);

router.get(
  "/:user_id",
  //   verifyToken,
  //   authorizeRoles("Admin", "Secretary", "Teacher"),
  getCoursesByUser
);

router.get("/", getCourses);


router.delete(
  "/:course_id",
  //   verifyToken,
  //   authorizeRoles("Admin", "Secretary"),
  deleteCourse);

export default router;
