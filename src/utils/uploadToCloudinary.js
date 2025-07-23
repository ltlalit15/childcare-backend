
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export const uploadToCloudinary = async (filePath, folder = 'documents') => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto',
  });
  // Remove local file after upload
  fs.unlinkSync(filePath);
  return result.secure_url;
};
