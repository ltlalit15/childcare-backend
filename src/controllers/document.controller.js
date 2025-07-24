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
    // Query for general documents (from documents table)
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
        r2.name AS submitted_by_role
      FROM documents d
      LEFT JOIN users u1 ON d.upload_for_user_id = u1.user_id
      LEFT JOIN roles r1 ON u1.role_id = r1.role_id
      LEFT JOIN users u2 ON d.submitted_by_user_id = u2.user_id
      LEFT JOIN roles r2 ON u2.role_id = r2.role_id
      ORDER BY d.id DESC
    `;

    // Query for CHILD documents (from children table)
    const childDocQuery = `
      SELECT 
        child_id,
        first_name,
        last_name,
        medical_form_url,
        immunization_record_url,
        lunch_form_url,
        agreement_docs_url
      FROM children
      WHERE 
        medical_form_url IS NOT NULL OR
        immunization_record_url IS NOT NULL OR
        lunch_form_url IS NOT NULL OR
        agreement_docs_url IS NOT NULL
    `;

    // Query for STAFF documents (from teachers table)
    const staffDocQuery = `
      SELECT 
        teacher_id,
        teacher_name AS full_name,
        medical_form,
        credentials,
        cbc_worksheet,
        auth_affirmation_form,
        mandated_reporter_cert,
        preventing_sids_cert
      FROM teachers
    `;

    const [generalDocs] = await pool.query(generalQuery);
    const [childDocRows] = await pool.query(childDocQuery);
    const [staffDocRows] = await pool.query(staffDocQuery);

    // Populate child_documents from children table
    const child_documents = childDocRows.map((child) => ({
      child_id: child.child_id,
      child_name: `${child.first_name || ''} ${child.last_name || ''}`.trim(),
      medical_form_url: child.medical_form_url,
      immunization_record_url: child.immunization_record_url,
      lunch_form_url: child.lunch_form_url,
      agreement_docs_url: child.agreement_docs_url,
    }));

    // Populate staff_documents from teachers table
    const staff_documents = staffDocRows.map((staff) => ({
      teacher_id: staff.teacher_id,
      teacher_name: staff.full_name,
      medical_form: staff.medical_form,
      credentials: staff.credentials,
      cbc_worksheet: staff.cbc_worksheet,
      auth_affirmation_form: staff.auth_affirmation_form,
      mandated_reporter_cert: staff.mandated_reporter_cert,
      preventing_sids_cert: staff.preventing_sids_cert,
    }));

    // Populate location_documents from generalDocs where no upload_for_user_id
    const location_documents = generalDocs.filter(doc => !doc.upload_for_user_id);

    return sendResponse(res, 200, "Documents retrieved successfully", {
      child_documents,
      staff_documents,
      location_documents
    });
  } catch (error) {
    console.error("Get Documents Error:", error);
    return sendError(res, 500, "Failed to retrieve documents", error.message);
  }
};

