import express from 'express';
import { registerUser, loginUser, getUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller.js';
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getUsers);
router.get("/:user_id", getUserById);
router.patch("/:user_id", updateUser);
router.delete("/:user_id",deleteUser);


export default router;
