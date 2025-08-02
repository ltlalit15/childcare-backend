import express from 'express';

import { forgotPassword, resetPassword } from '../controllers/forgetPassword.controller.js';


const router = express.Router();
router.post('/forgot-password', forgotPassword);

// ✅ Reset password route (set new password using token)
router.post('/reset-password', resetPassword);

export default router;