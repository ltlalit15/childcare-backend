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




export const getDocuments = async (req, res) => {
  try {
    const query = `
      SELECT 
        d.id AS document_id,
        d.document_title,
        d.document_url,
        d.upload_for_user_id,
        u1.first_name AS upload_for_first_name,
        u1.last_name AS upload_for_last_name,
        r1.role_name AS upload_for_role,
        d.upload_for_name,
        d.expiry_date,
        d.submitted_by_user_id,
        u2.first_name AS submitted_by_first_name,
        u2.last_name AS submitted_by_last_name,
        r2.role_name AS submitted_by_role,
        d.created_at
      FROM documents d
      LEFT JOIN users u1 ON d.upload_for_user_id = u1.user_id
      LEFT JOIN roles r1 ON u1.role_id = r1.role_id
      LEFT JOIN users u2 ON d.submitted_by_user_id = u2.user_id
      LEFT JOIN roles r2 ON u2.role_id = r2.role_id
      ORDER BY d.created_at DESC
    `;

    const [rows] = await pool.query(query);

    return sendResponse(res, 200, "Documents retrieved successfully", rows);
  } catch (error) {
    console.error("Get Documents Error:", error);
    return sendError(res, 500, "Failed to retrieve documents", error.message);
  }
};



