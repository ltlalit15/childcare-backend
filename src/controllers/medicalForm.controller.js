import pool from "../config/db.js";
import { sendError, sendResponse } from "../utils/response.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

// Create medical form
export const createMedicalForm = async (req, res) => {
  try {
    const {
      user_id,
      // Personal Info
      first_name,
      last_name,
      date_of_birth,
      gender,
      address,
      phone,
      email,
      emergency_contact_name,
      emergency_contact_relationship,
      emergency_contact_phone,
      
      // Medical History
      medical_history,
      
      // Medications
      medications,
      
      // Allergies
      allergies,
      
      // Emergency Contact
      emergency_contact_name_emergency,
      emergency_contact_relationship_emergency,
      emergency_contact_phone_emergency,
      information_accurate_confirmation
    } = req.body;

    // Handle file uploads if any
    let documents = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const cloudinaryUrl = await uploadToCloudinary(file.path, 'medical-forms');
        documents.push(cloudinaryUrl);
      }
    }

    const [result] = await pool.query(
      `INSERT INTO medical_forms (
        user_id,
        first_name, last_name, date_of_birth, gender, address, phone, email,
        emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
        medical_history, medications, allergies,
        emergency_contact_name_emergency, emergency_contact_relationship_emergency, 
        emergency_contact_phone_emergency, information_accurate_confirmation,
        documents, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        first_name, last_name, date_of_birth, gender, address, phone, email,
        emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
        medical_history, medications, allergies,
        emergency_contact_name_emergency, emergency_contact_relationship_emergency,
        emergency_contact_phone_emergency, information_accurate_confirmation === "true",
        JSON.stringify(documents), 'pending'
      ]
    );

    return sendResponse(res, 201, "Medical form submitted successfully", { 
      id: result.insertId,
      message: "Your medical form has been submitted and is under review."
    });
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Failed to submit medical form", err.message);
  }
};

// Get all medical forms
export const getAllMedicalForms = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        mf.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email
       FROM medical_forms mf
       LEFT JOIN users u ON mf.user_id = u.user_id
       ORDER BY mf.created_at DESC`
    );
    
    // Parse documents JSON
    const formsWithParsedDocs = rows.map(form => ({
      ...form,
      documents: form.documents ? JSON.parse(form.documents) : []
    }));
    
    return sendResponse(res, 200, "Medical forms fetched successfully", formsWithParsedDocs);
  } catch (err) {
    return sendError(res, 500, "Failed to fetch medical forms", err.message);
  }
};

// Get medical form by ID
export const getMedicalFormById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT 
        mf.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email
       FROM medical_forms mf
       LEFT JOIN users u ON mf.user_id = u.user_id
       WHERE mf.id = ? AND mf.is_deleted = FALSE`,
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, 404, "Medical form not found");
    }

    // Parse documents JSON
    const form = {
      ...rows[0],
      documents: rows[0].documents ? JSON.parse(rows[0].documents) : []
    };

    return sendResponse(res, 200, "Medical form fetched successfully", form);
  } catch (err) {
    return sendError(res, 500, "Failed to get medical form", err.message);
  }
};

// Get medical forms by user ID
export const getMedicalFormsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM medical_forms 
       WHERE user_id = ? AND is_deleted = FALSE 
       ORDER BY created_at DESC`,
      [user_id]
    );
    
    // Parse documents JSON
    const formsWithParsedDocs = rows.map(form => ({
      ...form,
      documents: form.documents ? JSON.parse(form.documents) : []
    }));
    
    return sendResponse(res, 200, "User medical forms fetched successfully", formsWithParsedDocs);
  } catch (err) {
    return sendError(res, 500, "Failed to fetch user medical forms", err.message);
  }
};

// Update medical form
export const updateMedicalForm = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name, last_name, date_of_birth, gender, address, phone, email,
      emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
      medical_history, medications, allergies,
      emergency_contact_name_emergency, emergency_contact_relationship_emergency,
      emergency_contact_phone_emergency, information_accurate_confirmation,
      status
    } = req.body;

    // Handle file uploads if any
    let documents = null;
    if (req.files && req.files.length > 0) {
      documents = [];
      for (const file of req.files) {
        const cloudinaryUrl = await uploadToCloudinary(file.path, 'medical-forms');
        documents.push(cloudinaryUrl);
      }
    }

    let query = `
      UPDATE medical_forms SET
        first_name = ?, last_name = ?, date_of_birth = ?, gender = ?, 
        address = ?, phone = ?, email = ?,
        emergency_contact_name = ?, emergency_contact_relationship = ?, emergency_contact_phone = ?,
        medical_history = ?, medications = ?, allergies = ?,
        emergency_contact_name_emergency = ?, emergency_contact_relationship_emergency = ?,
        emergency_contact_phone_emergency = ?, information_accurate_confirmation = ?
    `;
    
    let params = [
      first_name, last_name, date_of_birth, gender, address, phone, email,
      emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
      medical_history, medications, allergies,
      emergency_contact_name_emergency, emergency_contact_relationship_emergency,
      emergency_contact_phone_emergency, information_accurate_confirmation === "true"
    ];

    // Add status if provided
    if (status) {
      query += ", status = ?";
      params.push(status);
    }

    // Add documents if uploaded
    if (documents) {
      query += ", documents = ?";
      params.push(JSON.stringify(documents));
    }

    query += " WHERE id = ?";
    params.push(id);

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return sendError(res, 404, "Medical form not found");
    }

    return sendResponse(res, 200, "Medical form updated successfully");
  } catch (err) {
    return sendError(res, 500, "Failed to update medical form", err.message);
  }
};

// Delete medical form (soft delete)
export const deleteMedicalForm = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE medical_forms SET is_deleted = TRUE WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return sendError(res, 404, "Medical form not found");
    }

    return sendResponse(res, 200, "Medical form deleted successfully");
  } catch (err) {
    return sendError(res, 500, "Failed to delete medical form", err.message);
  }
};

// Update form status (for admin approval/rejection)
export const updateFormStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return sendError(res, 400, "Invalid status. Must be 'pending', 'approved', or 'rejected'");
    }

    const [result] = await pool.query(
      `UPDATE medical_forms SET status = ?, admin_notes = ? WHERE id = ?`,
      [status, admin_notes || null, id]
    );

    if (result.affectedRows === 0) {
      return sendError(res, 404, "Medical form not found");
    }

    return sendResponse(res, 200, `Medical form ${status} successfully`);
  } catch (err) {
    return sendError(res, 500, "Failed to update form status", err.message);
  }
}; 