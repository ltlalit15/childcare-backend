import express  from "express";
import { updatePassword } from "../controllers/auth.controller.js";

const router = express.Router();

// Configure multer for file uploads

 router.post("/update-password/:userId", updatePassword);

 export default router;