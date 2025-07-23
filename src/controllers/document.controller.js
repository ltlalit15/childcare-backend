import pool from "../config/db.js";
import { sendError, sendResponse } from "../utils/response.js";
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
  
     const generalQuery = `
  SELECT 
    d.id AS document_id,
    d.medical_form_url,
    d.immunization_record_url,
    d.lunch_form_url,
    d.agreement_docs_url,
    d.upload_for_user_id,
    u1.first_name AS upload_for_first_name,
    u1.last_name AS upload_for_last_name,
    r1.name AS upload_for_role,

    d.expiry_date,
    d.submitted_by_user_id,
    u2.first_name AS submitted_by_first_name,
    u2.last_name AS submitted_by_last_name,
    r2.name AS submitted_by_role,
 
  FROM documents d
  LEFT JOIN users u1 ON d.upload_for_user_id = u1.user_id
  LEFT JOIN roles r1 ON u1.role_id = r1.role_id
  LEFT JOIN users u2 ON d.submitted_by_user_id = u2.user_id
  LEFT JOIN roles r2 ON u2.role_id = r2.role_id
  ORDER BY d.created_at DESC


    `;

    const childDocQuery = `
      SELECT 
        cd.id,
        cd.child_id,
        c.first_name,
        c.last_name,
        cd.medical_form_url,
        cd.immunization_record_url,
        cd.lunch_form_url,
        cd.agreement_docs_url
      FROM child_documents cd
      LEFT JOIN children c ON cd.child_id = c.child_id
    `;

    const [generalDocs] = await pool.query(generalQuery);
    const [childDocRows] = await pool.query(childDocQuery);

    const child_documents = [];
    const teacher_documents = [];
    const location_documents = [];

    for (const doc of generalDocs) {
      if (doc.upload_for_role === 'Child') {
        child_documents.push(doc);
      } else if (doc.upload_for_role === 'Teacher') {
        teacher_documents.push(doc);
      } else if (!doc.upload_for_user_id) {
        location_documents.push(doc);
      }
    }

    const child_other_documents = childDocRows.map((doc) => ({
      id: doc.id,
      child_id: doc.child_id,
      child_name: `${doc.first_name || ''} ${doc.last_name || ''}`.trim(),
      medical_form_url: doc.medical_form_url,
      immunization_record_url: doc.immunization_record_url,
      lunch_form_url: doc.lunch_form_url,
      agreement_docs_url: doc.agreement_docs_url,
    }));

    return sendResponse(res, 200, "Documents retrieved successfully", {
      general: {
        child_documents,
        teacher_documents,
        location_documents
      },
      child_other_documents
    });
  } catch (error) {
    console.error("Get Documents Error:", error);
    return sendError(res, 500, "Failed to retrieve documents", error.message);
  }
};

