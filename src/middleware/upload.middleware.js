import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/voice_recordings/';

        // 👇 Check and create folder if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

export const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowedExts = ['.mp3', '.wav', '.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.csv'];
        if (!allowedExts.includes(ext)) {
            return cb(new Error('Only .mp3, .wav, .pdf, .jpg, .jpeg, .png, .doc, .docx, .csv files are allowed'));
        }
        cb(null, true);
    }
});

export default upload;
