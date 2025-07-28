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
    // Query for CHILD documents
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

    // Query for STAFF documents
    const staffDocQuery = `
    SELECT 
  t.teacher_id,
  u.first_name,
  u.last_name,
  t.medical_form,
  t.credentials,
  t.cbc_worksheet,
  t.auth_affirmation_form,
  t.mandated_reporter_cert,
  t.preventing_sids_cert
FROM teachers t
LEFT JOIN users u ON t.user_id = u.user_id

    `;

    // Query for EVACUATION documents
    const evacuationDocQuery = `
      SELECT 
        e.evacuation_id AS id,
        e.date,
        e.document,
        e.remarks,
        u.first_name,
        u.last_name,
        'Evacuation' AS type
      FROM evacuations e
      LEFT JOIN users u ON e.conducted_by = u.user_id
      WHERE e.document IS NOT NULL
    `;

    // Query for FIRE DRILL documents
    const fireDrillDocQuery = `
      SELECT 
        f.fire_drill_id AS id,
        f.date,
        f.document,
        f.remarks,
        u.first_name,
        u.last_name,
        'Fire Drill' AS type
      FROM fire_drills f
      LEFT JOIN users u ON f.conductedby = u.user_id
      WHERE f.document IS NOT NULL
    `;

    const [childDocRows] = await pool.query(childDocQuery);
    const [staffDocRows] = await pool.query(staffDocQuery);
    const [evacuationDocs] = await pool.query(evacuationDocQuery);
    const [fireDrillDocs] = await pool.query(fireDrillDocQuery);

    // Combine both location-based document sources
    const location_documents = [...evacuationDocs, ...fireDrillDocs].map(doc => ({
      id: doc.id,
      type: doc.type,
      document_url: doc.document,
      conducted_by: `${doc.first_name || ''} ${doc.last_name || ''}`.trim(),
      date: doc.date,
      remarks: doc.remarks,
    }));

    // Format child docs
    const child_documents = childDocRows.map(child => ({
      child_id: child.child_id,
      child_name: `${child.first_name || ''} ${child.last_name || ''}`.trim(),
      medical_form_url: child.medical_form_url,
      immunization_record_url: child.immunization_record_url,
      lunch_form_url: child.lunch_form_url,
      agreement_docs_url: child.agreement_docs_url,
    }));

    // Format staff docs
const staff_documents = staffDocRows.map(staff => ({
  teacher_id: staff.teacher_id,
  teacher_name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim(),
  medical_form: staff.medical_form,
  credentials: staff.credentials,
  cbc_worksheet: staff.cbc_worksheet,
  auth_affirmation_form: staff.auth_affirmation_form,
  mandated_reporter_cert: staff.mandated_reporter_cert,
  preventing_sids_cert: staff.preventing_sids_cert,
}));


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

