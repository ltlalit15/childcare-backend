import express from "express";
import { createDC, fetchDC, getDCbyID,deleteDC } from "../controllers/dc.controller.js";

const router = express.Router();

router.post("/", createDC);
router.get("/", fetchDC);
router.get("/:id", getDCbyID);
router.delete("/:id", deleteDC);

export default router;
