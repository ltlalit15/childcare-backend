import express from "express";
import { createLunchForm, getLunchFormById, updateLunchForm, getAllLunchForms } from "../controllers/lunchform.controller.js";


const router = express.Router();

router.post("/", createLunchForm);
router.get("/:id", getLunchFormById);
router.patch("/:id", updateLunchForm);
router.get("/", getAllLunchForms)

export default router;
