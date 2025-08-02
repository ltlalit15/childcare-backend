import pool from '../config/db.js';

export const getAllTeachers = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT teacher_id, teacher_name FROM teachers");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ msg: "Error fetching teachers", error: err });
    }
};


// ✅ POST: Add Chat Message
export const addChatMessage = async (req, res) => {
    const { child_id, teacher_id, sender_type, message } = req.body;

    if (!child_id || !teacher_id || !sender_type || !message) {
        return res.status(400).json({ msg: "All fields are required." });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO child_callcentre (child_id, teacher_id, sender, message, created_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [child_id, teacher_id, sender_type, message]
        );

        res.status(201).json({ msg: "Message added successfully", message_id: result.insertId });
    } catch (err) {
        res.status(500).json({ msg: "Error adding message", error: err });
    }
};


export const getChatHistory = async (req, res) => {
    const { childId, teacherId } = req.params;
    console.log("Params Received:", childId, teacherId);

    try {
        const [rows] = await pool.query(
            `SELECT * FROM child_callcentre WHERE child_id = ? AND teacher_id = ? ORDER BY created_at ASC`,
            [childId, teacherId]
        );
        console.log("Rows Fetched:", rows);

        res.json(rows);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ msg: "Error fetching chat", error: err });
    }
};
