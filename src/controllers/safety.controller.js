import pool from '../config/db.js';
import { sendResponse } from '../utils/response.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

// ===== FIRE DRILLS =====
export const getFireDrills = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM fire_drills ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getFireDrillById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM fire_drills WHERE fire_drill_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Fire drill not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const createFireDrill = async (req, res) => {
  const { date, conductedby, remarks } = req.body;
  let document = null;

  if (req.file) {
    document = await uploadToCloudinary(req.file.path);
  }


  try {
    const [result] = await pool.query(
      `INSERT INTO fire_drills (date, conductedby, remarks, document)
       VALUES (?, ?, ?, ?)`,
      [date, conductedby, remarks, document]
    );

    // Fetch the inserted row
    const [rows] = await pool.query(`SELECT * FROM fire_drills WHERE fire_drill_id = ?`, [result.insertId]);

    return sendResponse(res, 201, "Fire drill added successfully", rows[0]);
  } catch (err) {
    return sendResponse(res, 500, "Error creating fire drill", { error: err.message });
  }
};


export const updateFireDrill = async (req, res) => {
  const { id } = req.params;
  const { date, conductedby, remarks } = req.body;
  // If updating the document, handle file upload

  let document = req.body.document || null;
  if (req.file) {
    document = await uploadToCloudinary(req.file.path);
  }






  try {
    const [result] = await pool.query(
      `UPDATE fire_drills 
       SET date = ?, conductedby = ?, remarks = ?, document = ?
       WHERE fire_drill_id = ?`,
      [date, conductedby, remarks, document, id]
    );

    if (result.affectedRows === 0) {
      return sendResponse(res, 404, "Fire drill  not found");
    }

    // Fetch the updated row
    const [rows] = await pool.query(
      `SELECT * FROM fire_drills WHERE fire_drill_id = ?`,
      [id]
    );

    return sendResponse(res, 200, "Fire drill updated successfully", rows[0]);
  } catch (err) {
    return sendResponse(res, 500, "Error updating fire drill", { error: err.message });
  }
};

export const deleteFireDrill = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM fire_drills WHERE fire_drill_id = ?', [id]);
    if (result.affectedRows === 0) {

      return res.status(404).json({ message: 'Fire drill not found' });
    }

    return sendResponse(res, 200, "Fire drill deleted successfully");

  }
  catch (err) {
    sendResponse(res, 500, "Error deleting fire drill", { error: err.message });
  }
};


// ===== EVACUATIONS =====
export const getEvacuations = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM evacuations ORDER BY date DESC');
    return sendResponse(res, 200, "Evacuations fetched successfully", rows);
  } catch (err) {
    return sendResponse(res, 500, "Error fetching evacuations", { error: err.message });
  }
};


export const getEvacuationsbyId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM evacuations WHERE evacuation_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Evacuation not found' });
    }
    return sendResponse(res, 200, "Evacuation fetched successfully", rows[0]);
  } catch (err) {
    return sendResponse(res, 500, "Error fetching evacuation", { error: err.message });
  }
};


export const createEvacuation = async (req, res) => {
  try {
    const { date, conducted_by, remarks } = req.body;

    // Input validation
    if (!date || !conducted_by || !remarks) {
      return sendResponse(res, 400, "Date, Conducted By, and Remarks are required");
    }

    let document = null;
    if (req.file) {
      try {
        document = await uploadToCloudinary(req.file.path);
      } catch (uploadErr) {
        return sendResponse(res, 500, "Document upload failed", { error: uploadErr.message });
      }
    }

    // Insert into database
    const [result] = await pool.query(
      `INSERT INTO evacuations (date, conducted_by, remarks, document)
       VALUES (?, ?, ?, ?)`,
      [date, conducted_by, remarks, document]
    );

    const [rows] = await pool.query(
      `SELECT * FROM evacuations WHERE evacuation_id = ?`,
      [result.insertId]
    );

    return sendResponse(res, 201, "Evacuation created successfully", rows[0]);

  } catch (err) {
    return sendResponse(res, 500, "Error creating Evacuation", { error: err.message });
  }
};



export const updateEvacuation = async (req, res) => {
  const { id } = req.params;
  const { date, conducted_by, remarks } = req.body;

  let document = req.body.document || null;
  if (req.file) {
    document = await uploadToCloudinary(req.file.path);
  }

  try {
    const [result] = await pool.query(
      `UPDATE evacuations SET date = ?, conducted_by = ?, remarks = ?, document = ? WHERE evacuation_id = ?`,
      [date, conducted_by, remarks, document, id]
    );

    if (result.affectedRows === 0) {
      return sendResponse(res, 404, "Evacuations not found");
    }


    const [rows] = await pool.query(`SELECT * FROM evacuations WHERE evacuation_id = ?`, [id]);


    return sendResponse(res, 200, "Evacuations updated successfully", rows[0]);
  } catch (err) {
    return sendResponse(res, 500, "Error updating Evacuations", { error: err.message });
  }
};

export const deleteEvacuation = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(`DELETE FROM evacuations WHERE evacuation_id = ?`, [id]);
    if (result.affectedRows === 0) {
      return sendResponse(res, 404, "Evacuations not found");
    }

    return sendResponse(res, 200, "Evacuations deleted successfully");
  } catch (err) {
    return sendResponse(res, 500, "Error deleting Evacuations", { error: err.message });
  }
}



// ===== EPIPEN TRACKER =====
export const getEpipens = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.id,
        c.full_name AS child_name,
        e.epipen_unique_id,
        e.expiry_date,
        e.status
      FROM epipen_trackers e
      JOIN children c ON e.child_id = c.child_id
      ORDER BY e.expiry_date
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const createEpipen = async (req, res) => {
  const { child_id, epipen_unique_id, expiry_date, status } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO epipen_trackers (child_id, epipen_unique_id, expiry_date, status)
       VALUES (?, ?, ?, ?)`,
      [child_id, epipen_unique_id, expiry_date, status]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const deleteEpipen = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      `DELETE FROM epipen_trackers WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Epipen not found' });
    }

    res.status(200).json({ message: 'Epipen deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateEpipen = async (req, res) => {
  const { id } = req.params;
  const { child_id, epipen_unique_id, expiry_date, status } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE epipen_trackers SET child_id = ?, epipen_unique_id = ?, expiry_date = ?, status = ? WHERE id = ?`,
      [child_id, epipen_unique_id, expiry_date, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Epipen not found or no changes made' });
    }

    res.status(200).json({ message: 'Epipen updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// CREATE
export const createSleepLog = async (req, res) => {
  const { child_id, classroom_id, nap_start, nap_end, notes } = req.body;

  try {
    // Convert time to full DATETIME format (assuming today's date)
    const today = new Date().toISOString().split('T')[0]; // "2025-07-23"
    const fullNapStart = `${today} ${nap_start}:00`; // "2025-07-23 13:00:00"
    const fullNapEnd = `${today} ${nap_end}:00`;     // "2025-07-23 15:30:00"

    const [result] = await pool.query(
      `INSERT INTO sleep_Logs (child_id, classroom_id, nap_start, nap_end, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [child_id, classroom_id, fullNapStart, fullNapEnd, notes]
    );

    const [rows] = await pool.query(
      `SELECT * FROM sleep_Logs WHERE id = ?`, [result.insertId]
    );

    return res.status(201).json({ message: "Sleep log added successfully", data: rows[0] });

  } catch (error) {
    return res.status(500).json({ message: "Error adding sleep log", error: error.message });
  }
};



export const updateSleepLog = async (req, res) => {
  const { id } = req.params;
  const { child_name, classroom, nap_start, nap_end, notes } = req.body;

  try {
    await pool.query(
      `UPDATE Sleep_Logs 
       SET child_name = ?, classroom = ?, nap_start = ?, nap_end = ?, notes = ?
       WHERE id = ?`,
      [child_name, classroom, nap_start, nap_end, notes, id]
    );

    const [rows] = await pool.query(`SELECT * FROM Sleep_Logs WHERE id = ?`, [id]);

    return res.status(200).json({ message: "Sleep log updated", data: rows[0] });

  } catch (error) {
    return res.status(500).json({ message: "Error updating sleep log", error: error.message });
  }
};


export const deleteSleepLog = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(`DELETE FROM Sleep_Logs WHERE id = ?`, [id]);
    return res.status(200).json({ message: "Sleep log deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting sleep log", error: error.message });
  }
};


// GET (with JOINs and Filters)
export const getSleepLogs = async (req, res) => {
  const { classroom, range } = req.query;

  let query = `
    SELECT sl.*, 
           CONCAT(c.first_name, ' ', c.last_name) AS child_name,
           cl.name AS classroom_name
    FROM sleep_logs sl
    JOIN children c ON sl.child_id = c.child_id
    JOIN classrooms cl ON sl.classroom_id = cl.classroom_id
    WHERE 1 = 1
  `;
  const params = [];

  if (classroom && classroom !== "All") {
    query += " AND cl.classroom_id = ?";
    params.push(classroom); // Ensure classroom is an ID now
  }

  if (range === "Today") {
    query += " AND DATE(sl.nap_start) = CURDATE()";
  } else if (range === "ThisWeek") {
    query += " AND YEARWEEK(sl.nap_start, 1) = YEARWEEK(CURDATE(), 1)";
  } else if (range === "ThisMonth") {
    query += " AND MONTH(sl.nap_start) = MONTH(CURDATE()) AND YEAR(sl.nap_start) = YEAR(CURDATE())";
  }

  try {
    const [rows] = await pool.query(query, params);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching sleep logs", error: error.message });
  }
};


export const addDiaperLog = async (req, res) => {
  const { child_id, classroom_id, time, changed_by, type, notes } = req.body;

  try {
    // Validate user_id (changed_by) exists
    const [user] = await pool.query(`SELECT user_id FROM users WHERE user_id = ?`, [changed_by]);
    if (user.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid user ID in 'changed_by'" });
    }

    // Convert time to full datetime using today's date
    const today = new Date().toISOString().split('T')[0]; // e.g., "2025-07-23"
    const fullDateTime = `${today} ${time}:00`; // e.g., "2025-07-23 17:31:00"

    const query = `
      INSERT INTO diaper_logs 
        (child_id, classroom_id, time, changed_by, type, notes) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [child_id, classroom_id, fullDateTime, changed_by, type, notes];
    
    await pool.query(query, values);
    
    res.status(201).json({ success: true, message: "Diaper log added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to add diaper log", error: error.message });
  }
};



export const getAllDiaperLogs = async (req, res) => { 
  try {
    const [rows] = await pool.query(`
      SELECT 
        dl.*, 
        CONCAT(u.first_name, ' ', u.last_name) AS changed_by_name,
        CONCAT(c.first_name, ' ', c.last_name) AS child_name,
        cr.name AS classroom_name
      FROM diaper_logs dl
      LEFT JOIN users u ON dl.changed_by = u.user_id
      LEFT JOIN children c ON dl.child_id = c.user_id
      LEFT JOIN classrooms cr ON cr.classroom_id = cr.classroom_id
      ORDER BY dl.time DESC
    `);

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch diaper logs", error: error.message });
  }
};


// ✅ Update Diaper Log with user_id validation
export const updateDiaperLog = async (req, res) => {
  const { id } = req.params;
  const { child_id, classroom_id, time, changed_by, type, notes } = req.body;

  try {
    // Validate user exists
    const [user] = await pool.query(`SELECT user_id FROM users WHERE user_id = ?`, [changed_by]);
    if (user.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid user ID in 'changed_by'" });
    }

    // Update diaper log
    const query = `
      UPDATE diaper_logs 
      SET child_id = ?, classroom_id = ?, time = ?, changed_by = ?, type = ?, notes = ? 
      WHERE id = ?
    `;
    const values = [child_id, classroom_id, time, changed_by, type, notes, id];
    
    await pool.query(query, values);
    res.status(200).json({ success: true, message: "Diaper log updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update diaper log", error: error.message });
  }
};


// ✅ Delete Diaper Log
export const deleteDiaperLog = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM diaper_logs WHERE id = ?", [id]);
    res.status(200).json({ success: true, message: "Diaper log deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete diaper log", error: error.message });
  }
};




// Get All Logs
export const getAllMaintenanceLogs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ml.*, 
        CONCAT(u.first_name, ' ', u.last_name) AS assignedto_name
      FROM maintenance_logs ml
      LEFT JOIN users u ON ml.assigned_to = u.user_id
      ORDER BY ml.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching logs", error: error.message });
  }
};

// Add New Log
export const addMaintenanceLog = async (req, res) => {
  const { request_title, location, date_reported, priority, status, assigned_to } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO maintenance_logs (request_title, location, date_reported, priority, status, assigned_to) VALUES (?, ?, ?, ?, ?, ?)`,
      [request_title, location, date_reported, priority, status, assigned_to]
    );
    res.json({ success: true, message: "Log added successfully", insertedId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding log", error: error.message });
  }
};

// Update Log
export const updateMaintenanceLog = async (req, res) => {
  const { id } = req.params;
  const { request_title, location, date_reported, priority, status, assigned_to } = req.body;
  try {
    await pool.query(
      `UPDATE maintenance_logs SET request_title = ?, location = ?, date_reported = ?, priority = ?, status = ?, assigned_to = ? WHERE id = ?`,
      [request_title, location, date_reported, priority, status, assigned_to, id]
    );
    res.json({ success: true, message: "Log updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating log", error: error.message });
  }
};

// Delete Log
export const deleteMaintenanceLog = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM maintenance_logs WHERE id = ?", [id]);
    res.json({ success: true, message: "Log deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting log", error: error.message });
  }
};
