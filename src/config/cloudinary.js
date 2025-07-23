import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;


// utils/uploadToCloudinary.js
// import cloudinary from './cloudinary.js';
// import fs from 'fs';

// export const uploadToCloudinary = async (filePath, folder = 'documents') => {
//   const result = await cloudinary.uploader.upload(filePath, {
//     folder,
//     resource_type: 'auto',
//   });
//   // Remove local file after upload
//   fs.unlinkSync(filePath);
//   return result.secure_url;
// };

