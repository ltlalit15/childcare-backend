import pool from "../config/db.js";
import { sendResponse, sendError } from "../utils/response.js";

// Create new lunch form
export const createLunchForm = async (req, res) => {
  try {
    const {
      user_id,
      meal_preference,
      portion_size,
      dietary_restrictions,
      allergies,
      notes,
      status,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO lunch_forms (user_id, meal_preference, portion_size, dietary_restrictions, allergies, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        meal_preference,
        portion_size,
        JSON.stringify(dietary_restrictions),
        allergies,
        notes,
        status,
      ]
    );

    return sendResponse(res, 201, "Lunch form submitted successfully", {
      id: result.insertId,
    });
  } catch (error) {
    console.error("Create lunch form failed:", error);
    return sendError(res, 500, "Failed to submit lunch form", error.message);
  }
};

// Get form by ID
export const getLunchFormById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM lunch_forms WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, 404, "Form not found");
    }

    const form = rows[0];
    form.dietary_restrictions = JSON.parse(form.dietary_restrictions);

    return sendResponse(res, 200, "Lunch form fetched successfully", form);
  } catch (error) {
    console.error("Fetch form failed:", error);
    return sendError(res, 500, "Failed to fetch lunch form", error.message);
  }
};

// Update form
export const updateLunchForm = async (req, res) => {
  const { id } = req.params;
  const {
    meal_preference,
    portion_size,
    dietary_restrictions,
    allergies,
    notes,
    status,
  } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM lunch_forms WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, 404, "Form not found");
    }

    await pool.query(
      `UPDATE lunch_forms 
       SET meal_preference = ?, portion_size = ?, dietary_restrictions = ?, allergies = ?, notes = ?, status = ?
       WHERE id = ?`,
      [
        meal_preference,
        portion_size,
        JSON.stringify(dietary_restrictions),
        allergies,
        notes,
        status,
        id,
      ]
    );

    return sendResponse(res, 200, "Lunch form updated successfully");
  } catch (error) {
    console.error("Update form failed:", error);
    return sendError(res, 500, "Failed to update lunch form", error.message);
  }
};

// Get all lunch forms (with optional filters)
export const getAllLunchForms = async (req, res) => {
  const { user_id, status } = req.query;

  try {
    let query = "SELECT * FROM lunch_forms WHERE 1=1";
    const params = [];

    if (user_id) {
      query += " AND user_id = ?";
      params.push(user_id);
    }

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    const [rows] = await pool.query(query, params);

    const parsedRows = rows.map(form => ({
      ...form,
      dietary_restrictions: JSON.parse(form.dietary_restrictions || "[]"),
    }));

    return sendResponse(res, 200, "All lunch forms fetched successfully", parsedRows);
  } catch (error) {
    console.error("Get all lunch forms failed:", error);
    return sendError(res, 500, "Failed to fetch lunch forms", error.message);
  }
};

