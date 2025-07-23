import pool from "../config/db.js";

export const addSignInEntry = async (req, res) => {
    const { user_id, date, signInTime, signOutTime, notes } = req.body;

    if (!user_id || !date || !signInTime || !signOutTime) {
        return res.status(400).json({ message: 'User ID, Date, Sign In & Sign Out time required' });
    }

    try {
        // Get user details from users table
        const [userRows] = await pool.query(
            'SELECT user_id, first_name, last_name, role_id FROM users WHERE user_id = ?',
            [user_id]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { first_name, last_name, role_id } = userRows[0];
        const fullName = `${first_name} ${last_name}`;

        // Insert into sign_in_entries table
        await pool.query(
            `INSERT INTO sign_in_entries (user_id, name, role, date, sign_in_time, sign_out_time, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user_id, fullName, role_id, date, signInTime, signOutTime, notes || '']
        );

        res.status(201).json({ message: 'Entry added successfully' });
    } catch (error) {
        console.error('Error adding sign-in entry:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllSignInEntries = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM sign_in_entries ORDER BY date DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching entries:', error);
        res.status(500).json({ message: 'Failed to fetch data' });
    }
};

export const getSignInEntryById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query(
            'SELECT * FROM sign_in_entries WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching entry:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateSignInEntry = async (req, res) => {
    const { id } = req.params;
    const { date, signInTime, signOutTime, notes } = req.body;

    try {
        const [result] = await pool.query(
            `UPDATE sign_in_entries 
       SET date = ?, sign_in_time = ?, sign_out_time = ?, notes = ? 
       WHERE id = ?`,
            [date, signInTime, signOutTime, notes, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        res.status(200).json({ message: 'Entry updated successfully' });
    } catch (error) {
        console.error('Error updating entry:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



export const deleteSignInEntry = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query(
            'DELETE FROM sign_in_entries WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        res.status(200).json({ message: 'Entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting entry:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
