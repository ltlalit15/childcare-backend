import pool from '../config/db.js';
import csv from 'csv-parser';
import { Readable } from 'stream';
export const createCampaign = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            campaign_name,
            description,
            target_group,
            schedule_date,
            schedule_time,
            message_type,
            message,
            retry_count = 3,
            retry_interval = 30
        } = req.body;

        let voice_file = null;

        if (!campaign_name || !message_type) {
            return res.status(400).json({ error: "Campaign Name and Message Type are required" });
        }

        if (message_type === 'Text to Speech') {
            if (!message) {
                return res.status(400).json({ error: "Message is required for Text to Speech" });
            }
        }

        if (message_type === 'Voice Recording') {
            if (!req.file) {
                return res.status(400).json({ error: "Voice file is required for Voice Recording" });
            }
            voice_file = req.file.filename;
        }

        await connection.query(
            `INSERT INTO call_campaigns (
        campaign_name, description, target_group, schedule_date, schedule_time,
        message_type, message, voice_file, retry_count, retry_interval
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                campaign_name,
                description || null,
                target_group || 'All Contacts',
                schedule_date || null,
                schedule_time || null,
                message_type,
                message || null,
                voice_file,
                retry_count,
                retry_interval
            ]
        );

        res.status(201).json({ message: "Campaign created successfully" });

    } catch (error) {
        console.error("Create Campaign Error:", error);
        res.status(500).json({ error: "An error occurred while creating the campaign" });
    } finally {
        connection.release();
    }
};


export const getAllCampaigns = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.query(`SELECT * FROM call_campaigns ORDER BY id DESC`);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Get Campaigns Error:", error);
        res.status(500).json({ error: "An error occurred while fetching campaigns" });
    } finally {
        connection.release();
    }
};



export const getCampaignSummary = async (req, res) => {
    try {
        // Get Active Campaigns Count (assuming future or today’s schedule)
        const [activeRows] = await pool.query(
            `SELECT COUNT(*) AS count FROM call_campaigns WHERE schedule_date >= CURDATE()`
        );

        // Simulate "change from last week"
        const activeChange = "12% increase from last week"; // You can calculate this if historical data is available

        // Total Contacts
        const [contactsRows] = await pool.query(
            `SELECT COUNT(*) AS count FROM contacts`
        );

        // New contacts this month
        const [newContactsRows] = await pool.query(
            `SELECT COUNT(*) AS count FROM contacts WHERE MONTH(added_on) = MONTH(CURDATE()) AND YEAR(added_on) = YEAR(CURDATE())`
        );

        // Call Success Rate (based on last 500 calls)
        const [callRows] = await pool.query(`
      SELECT status FROM calls ORDER BY id DESC LIMIT 500
    `);

        const totalCalls = callRows.length;
        const successfulCalls = callRows.filter(c => c.status === 'Success').length;
        const callSuccessRate = totalCalls > 0 ? `${Math.round((successfulCalls / totalCalls) * 100)}%` : '0%';

        res.json({
            active_campaigns: activeRows[0].count,
            active_campaigns_change: activeChange,
            total_contacts: contactsRows[0].count,
            new_contacts_this_month: newContactsRows[0].count,
            call_success_rate: callSuccessRate,
            calls_considered: totalCalls
        });

    } catch (error) {
        console.error("Error fetching campaign summary:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



export const updateCampaign = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            campaign_name,
            description,
            target_group,
            schedule_date,
            schedule_time,
            message_type,
            message,
            retry_count = 3,
            retry_interval = 30
        } = req.body;

        const { id: campaign_id } = req.params;

        if (!campaign_id || !campaign_name || !message_type) {
            return res.status(400).json({ error: "Campaign ID, Name, and Message Type are required" });
        }

        let voice_file = null;

        if (message_type === 'Text to Speech' && !message) {
            return res.status(400).json({ error: "Message is required for Text to Speech" });
        }

        if (message_type === 'Voice Recording') {
            if (!req.file) {
                return res.status(400).json({ error: "Voice file is required for Voice Recording" });
            }
            voice_file = req.file.filename;
        }

        await connection.query(
            `UPDATE call_campaigns SET 
                campaign_name = ?, 
                description = ?, 
                target_group = ?, 
                schedule_date = ?, 
                schedule_time = ?, 
                message_type = ?, 
                message = ?, 
                voice_file = ?, 
                retry_count = ?, 
                retry_interval = ?
            WHERE id = ?`,
            [
                campaign_name,
                description || null,
                target_group || 'All Contacts',
                schedule_date || null,
                schedule_time || null,
                message_type,
                message || null,
                voice_file,
                retry_count,
                retry_interval,
                campaign_id
            ]
        );

        res.json({ message: "Campaign updated successfully" });

    } catch (error) {
        console.error("Update Campaign Error:", error);
        res.status(500).json({ error: "An error occurred while updating the campaign" });
    } finally {
        connection.release();
    }
};


export const deleteCampaign = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).json({ error: "Campaign ID is required" });
        }

        const [result] = await pool.query(`DELETE FROM call_campaigns WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Campaign not found" });
        }

        res.json({ message: "Campaign deleted successfully" });

    } catch (error) {
        console.error("Delete Campaign Error:", error);
        res.status(500).json({ error: "An error occurred while deleting the campaign" });
    }
};


export const uploadContactsFromCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'CSV file is required' });
        }

        const results = [];

        const stream = Readable.from(req.file.buffer);

        stream.pipe(csv())
            .on('data', (row) => {
                if (row.name && row.phone && row.email) {
                    results.push([row.name, row.phone, row.email]);
                }
            })
            .on('end', async () => {
                if (results.length === 0) {
                    return res.status(400).json({ error: 'No valid rows found in CSV' });
                }

                const insertQuery = `
          INSERT INTO contacts (name, phone, email)
          VALUES ?
        `;
                await pool.query(insertQuery, [results]);

                res.json({ message: `${results.length} contacts uploaded successfully` });
            });

    } catch (error) {
        console.error('CSV Upload Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



//Contact Management

//Add Contact
export const addContact = async (req, res) => {
    try {
        const { name, phone, email, group_type, status, last_called } = req.body;

        const [result] = await pool.query(
            `INSERT INTO contacts (name, phone, email, added_on, group_type, last_called, status) 
       VALUES (?, ?, ?, NOW(), ?, ?, ?)`,
            [name, phone, email, group_type, last_called, status]
        );

        res.status(201).json({ message: "Contact added successfully", id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: "Failed to add contact", details: error.message });
    }
};




//Get Contact

export const getAllContacts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM contacts ORDER BY id DESC');
        res.status(200).json({
            success: true,
            total: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


//Delete Contact

export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(`DELETE FROM contacts WHERE id = ?`, [id]);

        res.json({ message: "Contact deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete contact", details: error.message });
    }
};


//Update Contact

export const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email, group_type, last_called, status } = req.body;

        await pool.query(
            `UPDATE contacts SET name=?, phone=?, email=?, group_type=?, last_called=?, status=? WHERE id=?`,
            [name, phone, email, group_type, last_called, status, id]
        );

        res.json({ message: "Contact updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update contact", details: error.message });
    }
};



//Recent call logs




export const getRecentCallLogs = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT 
        c.name AS contact_name,
        c.phone AS phone,
        cp.campaign_name AS campaign_name,
        cl.status,
        cl.duration_seconds,
        cl.called_at
      FROM call_logs cl
      JOIN contacts c ON cl.contact_id = c.id
      JOIN call_campaigns cp ON cl.campaign_id = cp.id
      ORDER BY cl.called_at DESC
      LIMIT 20
    `);

        const formatted = rows.map(row => ({
            contact: row.contact_name,
            phone: row.phone,
            campaign: row.campaign_name,

            status: row.status,
            duration: `${Math.floor(row.duration_seconds / 60)}:${('0' + (row.duration_seconds % 60)).slice(-2)}`,

        }));

        res.status(200).json({
            success: true,
            data: formatted
        });
    } catch (error) {
        console.error('Error fetching joined call logs:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};



// Insert Call Log

export const insertCallLog = async (req, res) => {
    try {
        const { contact_id, campaign_id, status, duration_seconds, called_at } = req.body;

        if (!contact_id || !campaign_id || !status || !duration_seconds || !called_at) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const [result] = await pool.query(
            `INSERT INTO call_logs (contact_id, campaign_id, status, duration_seconds, called_at)
       VALUES (?, ?, ?, ?, ?)`,
            [contact_id, campaign_id, status, duration_seconds, called_at]
        );

        res.status(201).json({
            success: true,
            message: "Call log inserted successfully",
            insertId: result.insertId,
        });
    } catch (error) {
        console.error("Insert Call Log Error:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
