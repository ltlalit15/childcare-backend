// controllers/eventForm.controller.js
import pool from "../config/db.js";
import { sendError, sendResponse } from "../utils/response.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

export const createEventForm = async (req, res) => {
  try {
    const {
      user_id,
      special_needs_type,
      accommodation_details,
      dietary_restrictions,
      medication_required,
      emergency_contact_name,
      emergency_contact_phone,
    } = req.body;

    // Upload files to Cloudinary and get URLs
    const documentUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const cloudinaryUrl = await uploadToCloudinary(file.path, 'specialneeds');
        documentUrls.push(cloudinaryUrl);
      }
    }

    const [result] = await pool.query(
      `INSERT INTO specialneeds_forms 
      (user_id, special_needs_type, accommodation_details, dietary_restrictions, medication_required,
       emergency_contact_name, emergency_contact_phone, documents) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        special_needs_type,
        accommodation_details,
        dietary_restrictions,
        medication_required === "true",
        emergency_contact_name,
        emergency_contact_phone,
        JSON.stringify(documentUrls),
      ]
    );

    return sendResponse(res, 201, "Event form submitted successfully", { id: result.insertId });
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Failed to submit form", err.message);
  }
};


export const getAllForms = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM specialneeds_forms ORDER BY created_at DESC`
    );
    
    // Parse documents JSON and ensure they are Cloudinary URLs
    const formsWithParsedDocs = rows.map(form => ({
      ...form,
      documents: form.documents ? JSON.parse(form.documents) : []
    }));
    
    return sendResponse(res, 200, "Forms fetched", formsWithParsedDocs);
  } catch (err) {
    return sendError(res, 500, "Failed to fetch forms", err.message);
  }
};

export const getFormById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM specialneeds_forms WHERE id = ? AND is_deleted = FALSE`,
      [id]
    );

    if (rows.length === 0) return sendError(res, 404, "Form not found");

    // Parse documents JSON
    const form = {
      ...rows[0],
      documents: rows[0].documents ? JSON.parse(rows[0].documents) : []
    };

    return sendResponse(res, 200, "Form fetched", form);
  } catch (err) {
    return sendError(res, 500, "Failed to get form", err.message);
  }
};

export const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      special_needs_type,
      accommodation_details,
      dietary_restrictions,
      medication_required,
      emergency_contact_name,
      emergency_contact_phone,
    } = req.body;

    await pool.query(
      `UPDATE specialneeds_forms SET
        special_needs_type = ?,
        accommodation_details = ?,
        dietary_restrictions = ?,
        medication_required = ?,
        emergency_contact_name = ?,
        emergency_contact_phone = ?
        WHERE id = ?`,
      [
        special_needs_type,
        accommodation_details,
        dietary_restrictions,
        medication_required === "true",
        emergency_contact_name,
        emergency_contact_phone,
        id,
      ]
    );

    return sendResponse(res, 200, "Form updated");
  } catch (err) {
    return sendError(res, 500, "Failed to update form", err.message);
  }
};

export const softDeleteForm = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(`UPDATE specialneeds_forms SET is_deleted = TRUE WHERE id = ?`, [id]);

    return sendResponse(res, 200, "Form soft-deleted");
  } catch (err) {
    return sendError(res, 500, "Failed to delete form", err.message);
  }
};