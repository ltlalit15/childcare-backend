import { sendEmail } from '../utils/sendEmail.js';
import db from '../config/db.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ status: 'fail', message: 'User not found with this email' });
        }

        const user = users[0];

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save token to DB
        await db.query(
            'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE user_id = ?',
            [hashedToken, tokenExpiry, user.user_id] // ✅ correct field
        );

        // Send reset link
        await sendEmail({
            email: user.email,
            subject: 'Reset Your Password',
            resetToken: resetToken
        });

        res.status(200).json({
            status: 'success',
            message: 'Reset token sent to email!',
            resetToken: resetToken // Only for debugging (remove in production)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Error sending reset email' });
    }
};





export const resetPassword = async (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
        return res.status(400).json({ status: 'fail', message: 'All fields are required.' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ status: 'fail', message: 'Passwords do not match.' });
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const [users] = await db.query(
            'SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires > ?',
            [hashedToken, new Date()]
        );

        if (users.length === 0) {
            return res.status(400).json({ status: 'fail', message: 'Token is invalid or has expired.' });
        }

        const user = users[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear token
        await db.query(
            'UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE user_id = ?',
            [hashedPassword, user.user_idid]
        );

        res.status(200).json({
            status: 'success',
            message: 'Password reset successfully.'
        });

    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
};