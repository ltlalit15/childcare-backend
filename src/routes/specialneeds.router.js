// routes/eventForm.routes.js
import express from "express";

import { createEventForm, getAllForms, getFormById, softDeleteForm, updateForm } from "../controllers/specialneeds.controller.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/", upload.array("documents", 5), createEventForm);
router.get("/", getAllForms);
router.get("/:id", getFormById);
router.put("/:id", updateForm);
router.delete("/:id", softDeleteForm);

export default router;
