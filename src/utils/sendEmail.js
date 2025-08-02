import nodemailer from 'nodemailer';

export const sendEmail = async ({ email, subject, resetToken }) => {
    const resetURL = `http://localhost:5000/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "packageitappofficially@gmail.com",
            pass: 'epvuqqesdioohjvi'
            ,
        }
    });

    const mailOptions = {
        from: '"Your App" <your@email.com>',
        to: email,
        subject: subject,
        html: `
            <h2>Password Reset Request</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${resetURL}">${resetURL}</a>
            <p>This link will expire in 10 minutes.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};
