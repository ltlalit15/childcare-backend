import pool from '../config/db.js';
import { sendResponse } from '../utils/response.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

// ===== FIRE DRILLS =====
export const getFireDrills = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Fire_Drills ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getFireDrillById = async (req, res) => {
  const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Fire_Drills WHERE fire_drill_id = ?', [id]);
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

  if(req.file ) {
     document = await uploadToCloudinary(req.file.path);
  }
 

  try {
    const [result] = await pool.query(
      `INSERT INTO Fire_Drills (date, conductedby, remarks, document)
       VALUES (?, ?, ?, ?)`,
      [date, conductedby, remarks, document]
    );

    // Fetch the inserted row
const [rows] = await pool.query(`SELECT * FROM Fire_Drills WHERE fire_drill_id = ?`, [result.insertId]);

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
      `UPDATE Fire_Drills 
       SET date = ?, conductedby = ?, remarks = ?, document = ?
       WHERE fire_drill_id = ?`,
      [date, conductedby, remarks, document, id]
    );

    if (result.affectedRows === 0) {
      return sendResponse(res, 404, "Fire drill  not found");
    }

    // Fetch the updated row
    const [rows] = await pool.query(
      `SELECT * FROM Fire_Drills WHERE fire_drill_id = ?`,
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
    const [result] = await pool.query('DELETE FROM Fire_Drills WHERE fire_drill_id = ?', [id]);
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
    const [rows] = await pool.query('SELECT * FROM Evacuations ORDER BY date DESC');
  return  sendResponse(res, 200, "Evacuations fetched successfully", rows);
  } catch (err) {
   return sendResponse(res, 500, "Error fetching evacuations", { error: err.message });
  }
};


export const getEvacuationsbyId = async (req, res) => {
  try {
    const  { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM Evacuations WHERE evacuation_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Evacuation not found' });
    }
    return sendResponse(res, 200, "Evacuation fetched successfully", rows[0]);
  } catch (err) {
    return sendResponse(res, 500, "Error fetching evacuation", { error: err.message });
  }
  };



export const createEvacuation = async (req, res) => {
  const { date, conducted_by_staff_id, remarks, } = req.body;
    let document = null;
     if(req.file) {
      document = await uploadToCloudinary(req.file.path);
     }
  // const document = req.file ? req.file.path : null;
  try {
    const [result] = await pool.query(
      `INSERT INTO Evacuations (date, conducted_by_staff_id, remarks, document)
       VALUES (?, ?, ?, ?)`,
      [date, conducted_by_staff_id, remarks, document]
    );
    const [rows] = await pool.query(
      `SELECT * FROM Evacuations WHERE evacuation_id = ?`,
      [result.insertId]
    );
    return sendResponse(res, 201, "Evacuation created successfully", rows[0]);
  } catch (err) {
    return sendResponse(res, 500, "Error creating Evacuation", { error: err.message });
  }
};


export const updateEvacuation = async (req, res) => {
  const { id } = req.params;
    const { date, conducted_by_staff_id, remarks } = req.body;
   
     let document = req.body.document || null;
  if (req.file) {
    document = await uploadToCloudinary(req.file.path);
  }

    try {
      const [result] = await pool.query(
        `UPDATE Evacuations SET date = ?, conducted_by_staff_id = ?, remarks = ?, document = ? WHERE evacuation_id = ?`,
        [date, conducted_by_staff_id, remarks, document, id]
      );

       if (result.affectedRows === 0) {
      return sendResponse(res, 404, "Evacuations not found");
    }
 

    const [rows] = await pool.query(`SELECT * FROM Evacuations WHERE evacuation_id = ?`, [id]);


    return sendResponse(res, 200, "Evacuations updated successfully", rows[0]);
  } catch (err) {
    return sendResponse(res, 500, "Error updating Evacuations", { error: err.message });
  }
};

export const deleteEvacuation = async (req, res) => {
    const { id } = req.params;
  try {
    const [ result ] = await pool.query( `DELETE FROM Evacuations WHERE evacuation_id = ?`, [id]);
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
    const [rows] = await pool.query('SELECT * FROM Epipen_Tracker ORDER BY expiry_date');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createEpipen = async (req, res) => {
  const { child_id, epipen_unique_id, expiry_date, status } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO Epipen_Tracker (child_id, epipen_unique_id, expiry_date, status)
       VALUES (?, ?, ?, ?)`,
      [child_id, epipen_unique_id, expiry_date, status]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
