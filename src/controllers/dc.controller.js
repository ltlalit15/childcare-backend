import pool from "../config/db.js";
import { sendError, sendResponse } from "../utils/response.js";

export const createDC = async (req, res) => {
  const { dc_number, created_by } = req.body;
  try {
    const [result] = await pool.query(`INSERT INTO delivery_challans (dcNumber, created_by) VALUES ( ? , ? )`, [dc_number, created_by]);

    const id = result.insertId;
    const [rows] = await pool.query(`SELECT * FROM delivery_challans WHERE id = ?`, [id])
    return sendResponse(res, 201, " Delivery Challan created successfully", rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return sendError(res, 400, "Delivery Challan already exists(DC number must be unique)", { error: err.message });
    } else {
      return sendError(res, 500, "Internal Server Error", { error: err.message });
    }
  }
}

export const fetchDC = async (req, res) => {
  try {
    const [result] = await pool.query('SELECT * FROM delivery_challans');
    return sendResponse(res, 200, "Delivery Challans fetched successfully", result);
  } catch (error) {
    return sendError(res, 500, "Internal Server Error", { error: error.message });
  }
}

export const getDCbyID = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('SELECT * FROM delivery_challans WHERE id = ? ', [id]);
    return sendResponse(res, 200, "Delivery Challan fetched successfully", result[0]);
  } catch (err) {
    return sendError(res, 500, "Internal Server Error", { error: err.message });
  }
}


export const deleteDC = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM delivery_challans WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Delivery Challan not found' });
    }

    return sendResponse(res, 200, "Delivery Challan deleted successfully", { deletedId: id });
  }
  catch (error) {
    return sendError(res, 500, "Internal Server Error", { error: error.message });
  }
}

