import express from 'express';

import {
    getAllTeachers,
    getChatHistory,
    addChatMessage
} from '../controllers/childCallCentre.controller.js';

const router = express.Router();

router.get("/teachers", getAllTeachers);
router.get("/chat-history/:childId/:teacherId", getChatHistory);
router.post("/chat", addChatMessage);


export default router;
