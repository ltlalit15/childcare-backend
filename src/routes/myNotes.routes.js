import express from 'express';


import {
    createNote, getAllNotes
    , getNoteById
    , updateNote,
    deleteNote
    , getNotesByChildId,
    getNotesByTeacherId,
  
} from "../controllers/myNotes.controller.js";
const router = express.Router();
// Routes
router.post("/", createNote);
router.get("/", getAllNotes);
router.get("/:id", getNoteById);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.get("/child/:childId", getNotesByChildId);


router.get("/teacher/:teacherId", getNotesByTeacherId);

export default router;
