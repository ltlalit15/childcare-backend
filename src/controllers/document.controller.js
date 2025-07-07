import pool from "../config/db.js";
import { sendResponse } from "../utils/response.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

export const uploadDocument = async (req, res) => {
  try {
    const {
      document_title,
      upload_for_user_id,     // The user the doc is for
      upload_for_name,
      expiry_date,
      submitted_by_user_id    // The user submitting it
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Document file is required' });
    }

    const document_url = await uploadToCloudinary(req.file.path);

    const insertQuery = `
      INSERT INTO documents 
        (document_title, document_url, upload_for_user_id, upload_for_name, expiry_date, submitted_by_user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(insertQuery, [
      document_title,
      document_url,
      upload_for_user_id,
      upload_for_name,
      expiry_date,
      submitted_by_user_id,
    ]);

    const document_id = result.insertId;

    const documentDetails = {
      document_id,
      document_title,
      document_url,
      upload_for_user_id: parseInt(upload_for_user_id),
      upload_for_name,
      expiry_date,
      submitted_by_user_id: parseInt(submitted_by_user_id),
      created_at: new Date().toISOString()
    };

    return sendResponse(res, 201, 'Document uploaded successfully', documentDetails);

  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ error: 'Something went wrong while uploading the document' });
  }
};
