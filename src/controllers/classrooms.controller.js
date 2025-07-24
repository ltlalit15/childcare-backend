import pool from '../config/db.js';
import { sendError, sendResponse } from '../utils/response.js';

export const getAllClassrooms = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM classrooms');
    return sendResponse(res, 200, 'Classroom retrieved successfully', rows);
  } catch (err) {
   sendError(res, 500, 'Failed To get Classroom');
  }
};

export const getClassroomById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM classrooms WHERE classroom_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Classroom not found' });
    return sendResponse(res, 200, 'Classroom retrieved successfully', rows[0]);
  } catch (err) {
    return sendError(res, 500, 'Failed To get Classroom');
  }
};

export const createClassroom = async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO classrooms (name) VALUES (?)', [name]);
    // res.status(201).json({ id: result.insertId });
    sendResponse(res, 201, 'Classroom created successfully',{ id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Classroom name must be unique' });
      sendError(res, 400, 'Classroom name must be unique', { err: err.message });
    } else {
     sendError(res, 500, 'Failed To Add Classroom', { err: err.message });
    }
  }
};

export const updateClassroom = async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await pool.query('UPDATE classrooms SET name = ? WHERE classroom_id = ?', [name, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Classroom not found' });
    res.json({ message: 'Classroom updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteClassroom = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM classrooms WHERE classroom_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Classroom not found' });

     sendResponse(res, 201, 'Classroom deleted successfully',{ message: 'Classroom deleted' });

  } catch (err) {
    sendError(res, 500, 'Classroom deletion Failed',{ message: 'Classroom deleted' });
   
  }
};
