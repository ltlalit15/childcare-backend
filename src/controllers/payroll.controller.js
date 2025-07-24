import pool from "../config/db.js";

import dayjs from "dayjs";
// ADD EMPLOYEE
export const addEmployee = async (req, res) => {
    const { full_name, phone, ssn, address, teacher_id } = req.body;

    try {
        let prefillData = {};

        if (teacher_id) {
            const [teacherRows] = await pool.query(`SELECT full_name, phone FROM teachers WHERE user_id = ?`, [teacher_id]);
            if (teacherRows.length === 0) return res.status(404).json({ message: 'Teacher not found' });
            prefillData = teacherRows[0];
        }

        const finalData = {
            full_name: full_name || prefillData.full_name,
            phone: phone || prefillData.phone,
            ssn,
            address
        };

        await pool.query(
            `INSERT INTO employees (full_name, phone, ssn, address) VALUES (?, ?, ?, ?)`,
            [finalData.full_name, finalData.phone, finalData.ssn, finalData.address]
        );

        res.status(201).json({ message: 'Employee added successfully' });
    } catch (err) {
        console.error('Add Employee Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// GET ALL EMPLOYEES
export const getAllEmployees = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM employees ORDER BY user_id DESC`);
        res.status(200).json(rows);
    } catch (err) {
        console.error("Get All Employees Error:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// ADD PAYROLL ENTRY
export const addPayrollEntry = async (req, res) => {
    const { user_id, amount, recurrence } = req.body;

    if (!user_id || !amount || !recurrence) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const [emp] = await pool.query("SELECT * FROM users WHERE user_id = ?", [user_id]);
        if (emp.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        await pool.query(
            `INSERT INTO payroll_entries (user_id, amount, recurrence) VALUES (?, ?, ?)`,
            [user_id, amount, recurrence]
        );

        res.status(201).json({ message: "Payroll entry added successfully" });
    } catch (err) {
        console.error("Error adding payroll:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// GET ALL PAYROLL
export const getAllPayrollEntries = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.*, 
                CONCAT(u.first_name, ' ', u.last_name) AS employee_name
            FROM payroll_entries p
            JOIN users u ON p.user_id = u.user_id
            ORDER BY p.created_at DESC
        `);
        res.status(200).json(rows);
    } catch (err) {
        console.error("Fetch payroll entries error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// UPDATE PAYROLL ENTRY
export const updatePayrollEntry = async (req, res) => {
    const { id } = req.params; // This should be the payroll entry ID
    const { amount, recurrence } = req.body;

    try {
        const [result] = await pool.query(
            `UPDATE payroll_entries SET amount = ?, recurrence = ? WHERE id = ?`,
            [amount, recurrence, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Payroll entry not found" });
        }

        res.status(200).json({ message: "Payroll entry updated", updated_id: id });
    } catch (err) {
        console.error("Update payroll error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


// DELETE PAYROLL ENTRY

// DELETE PAYROLL ENTRY
export const deletePayrollEntry = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query(
            `DELETE FROM payroll_entries WHERE user_id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Payroll entry not found" });
        }

        res.status(200).json({ message: "Payroll entry deleted", deleted_id: id });
    } catch (err) {
        console.error("Delete payroll error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


export const getPayrollSummary = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                CONCAT(u.first_name, ' ', u.last_name) AS employee_name,
                p.amount,
                p.recurrence,
                p.created_at
            FROM payroll_entries p
            JOIN users u ON u.user_id = p.user_id
        `);

        const summary = rows.map(entry => {
            const created = dayjs(entry.created_at);
            const recurrence = entry.recurrence?.toLowerCase();
            let nextPayment = created;
            let lastPayment = created;

            switch (recurrence) {
                case "monthly":
                    nextPayment = created.add(1, "month");
                    break;
                case "weekly":
                    nextPayment = created.add(1, "week");
                    break;
                case "daily":
                    nextPayment = created.add(1, "day");
                    break;
                default:
                    nextPayment = "N/A";
            }

            return {
                employee_name: entry.employee_name,
                amount: entry.amount,
                recurrence: entry.recurrence,
                last_payment: created.format("YYYY-MM-DD"),
                next_payment: typeof nextPayment === "string"
                    ? nextPayment
                    : nextPayment.format("YYYY-MM-DD")
            };
        });

        res.json({ success: true, data: summary });
    } catch (err) {
        console.error("Error in payroll summary:", err);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

