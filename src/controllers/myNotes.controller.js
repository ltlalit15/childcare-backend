import pool from '../config/db.js';

// ✅ Add Note
export const createNote = async (req, res) => {
    try {
        const { child_id, teacher_id, note, category } = req.body;
        if (!child_id || !teacher_id || !note) {
            return res.status(400).json({ msg: "All required fields must be filled." });
        }

        const [result] = await pool.query(
            "INSERT INTO my_notes (child_id, teacher_id, note, category) VALUES (?, ?, ?, ?)",
            [child_id, teacher_id, note, category]
        );

        res.status(201).json({ msg: "Note added successfully", id: result.insertId });
    } catch (error) {
        res.status(500).json({ msg: "Error adding note", error });
    }
};

// ✅ Get All Notes
export const getAllNotes = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM my_notes ORDER BY created_at DESC");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ msg: "Error fetching notes", error });
    }
};

// ✅ Get Note By ID
export const getNoteById = async (req, res) => {
    try {
        const noteId = req.params.id;
        const [rows] = await pool.query("SELECT * FROM my_notes WHERE id = ?", [noteId]);

        if (rows.length === 0) {
            return res.status(404).json({ msg: "Note not found" });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ msg: "Error fetching note", error });
    }
};

// ✅ Update Note
export const updateNote = async (req, res) => {
    try {
        const noteId = req.params.id;
        const { child_id, teacher_id, note, category } = req.body;

        const [result] = await pool.query(
            "UPDATE my_notes SET child_id = ?, teacher_id = ?, note = ?, category = ? WHERE id = ?",
            [child_id, teacher_id, note, category, noteId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: "Note not found or not updated" });
        }

        res.json({ msg: "Note updated successfully" });
    } catch (error) {
        res.status(500).json({ msg: "Error updating note", error });
    }
};

// ✅ Delete Note
export const deleteNote = async (req, res) => {
    try {
        const noteId = req.params.id;

        const [result] = await pool.query("DELETE FROM my_notes WHERE id = ?", [noteId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: "Note not found" });
        }

        res.json({ msg: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ msg: "Error deleting note", error });
    }
};



export const getNotesByChildId = async (req, res) => {
    try {
        const childId = req.params.childId;
        console.log("Getting notes for childId:", childId);

        const [rows] = await pool.query("SELECT * FROM my_notes WHERE child_id = ?", [childId]);

        if (rows.length === 0) {
            return res.status(404).json({ msg: "No notes found for this child" });
        }

        res.json(rows);
    } catch (error) {
        res.status(500).json({ msg: "Error fetching notes", error });
    }
};


export const getNotesByTeacherId = async (req, res) => {
    try {

        const teacherId = req.params.teacherId;
        console.log("Teacher ID received in request:", teacherId);
        const [rows] = await pool.query("SELECT * FROM my_notes WHERE teacher_id = ?", [teacherId]);

        if (rows.length === 0) {
            return res.status(404).json({ msg: "No notes found for this teacher" }); // ✅ Fixed here
        }

        res.json(rows);
    } catch (error) {
        res.status(500).json({ msg: "Error fetching notes", error });
    }
};

