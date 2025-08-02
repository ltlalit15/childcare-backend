import express from "express";
import { getUserAttendance } from "../controllers/attendance.controller.js";
const router = express.Router();
// Route to get attendance by user ID
router.get('/:user_id', getUserAttendance);

export default router;
