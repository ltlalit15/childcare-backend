

import pool from '../config/db.js';
export const addTransaction = async (req, res) => {
    const { transaction_type, category, amount, date, note } = req.body;

    if (!['income', 'expense'].includes(transaction_type)) {
        return res.status(400).json({ message: "Invalid transaction type" });
    }

    if (!category || !amount || !date) {
        return res.status(400).json({ message: "Category, amount and date are required" });
    }

    try {
        const sql = `
      INSERT INTO transactions (transaction_type, category, amount, date, note)
      VALUES (?, ?, ?, ?, ?)
    `;
        const values = [transaction_type, category, amount, date, note || null];

        await pool.execute(sql, values);

        return res.status(201).json({ message: "Transaction added successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
};


export const getAllTransactions = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM transactions ORDER BY date DESC");
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch transactions" });
    }
};


export const deleteTransaction = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query("DELETE FROM transactions WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete transaction" });
    }
};


export const updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { transaction_type, category, amount, date, note } = req.body;

    if (!['income', 'expense'].includes(transaction_type)) {
        return res.status(400).json({ message: "Invalid transaction type" });
    }

    if (!category || !amount || !date) {
        return res.status(400).json({ message: "Category, amount and date are required" });
    }

    try {
        const [result] = await pool.query(`
      UPDATE transactions 
      SET transaction_type = ?, category = ?, amount = ?, date = ?, note = ?
      WHERE id = ?
    `, [transaction_type, category, amount, date, note || null, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json({ message: "Transaction updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update transaction" });
    }
};


// export const filterTransactions = async (req, res) => {
//     const { type, category, startDate, endDate } = req.query;

//     let sql = "SELECT * FROM transactions WHERE 1=1";
//     const values = [];

//     if (type) {
//         sql += " AND transaction_type = ?";
//         values.push(type);
//     }

//     if (category) {
//         sql += " AND category = ?";
//         values.push(category);
//     }

//     if (startDate && endDate) {
//         sql += " AND date BETWEEN ? AND ?";
//         values.push(startDate, endDate);
//     } else if (startDate) {
//         sql += " AND date >= ?";
//         values.push(startDate);
//     } else if (endDate) {
//         sql += " AND date <= ?";
//         values.push(endDate);
//     }

//     sql += " ORDER BY date DESC";

//     try {
//         const [rows] = await pool.query(sql, values);
//         res.status(200).json(rows);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Failed to filter transactions" });
//     }
// };




export const addCategory = async (req, res) => {
    const { name, type, description } = req.body;

    if (!name || !type) {
        return res.status(400).json({ message: "Name and type are required" });
    }
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: "Type must be 'income' or 'expense'" });
    }

    try {
        const sql = `
      INSERT INTO categories (name, description, type)
      VALUES (?, ?, ?)
    `;
        await pool.execute(sql, [name, description || null, type]);

        return res.status(201).json({ message: "Category added successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
};


// GET /api/transactions/ all-month monthly-summary
export const getAllMonthlySummary = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                MONTHNAME(date) AS month,
                MONTH(date) AS month_number,
                SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) AS total_income,
                SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) AS total_expense
            FROM transactions
            GROUP BY MONTH(date)
            ORDER BY MONTH(date)
        `);

        const months = [];
        const earnings = [];
        const expenses = [];
        const profit = [];

        rows.forEach(row => {
            months.push(row.month); // e.g., "July"
            earnings.push(Number(row.total_income));
            expenses.push(Number(row.total_expense));
            profit.push(Number(row.total_income) - Number(row.total_expense));
        });

        res.json({
            months,
            earnings,
            expenses,
            profit
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch monthly summary" });
    }
};



// GET /api/transactions/monthly-summary?month=Jun
// GET /api/transactions/monthly-summary
export const getMonthlySummary = async (req, res) => {
    try {
        const { month } = req.query;

        // Month filter condition
        let filterQuery = '';
        let params = [];

        if (month) {
            filterQuery = 'WHERE MONTHNAME(date) = ?';
            params.push(month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()); // normalize e.g. dec -> Dec
        }

        const [rows] = await pool.query(`
            SELECT 
                MONTHNAME(date) AS month,
                MONTH(date) AS month_number,
                SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) AS total_income,
                SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) AS total_expense
            FROM transactions
            ${filterQuery}
            GROUP BY MONTH(date)
            ORDER BY MONTH(date)
        `, params);

        const monthsMap = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let earnings = [];
        let expenses = [];
        let profit = [];
        let months = [];

        rows.forEach(row => {
            const index = row.month_number - 1;
            earnings.push(Number(row.total_income));
            expenses.push(Number(row.total_expense));
            profit.push(Number(row.total_income) - Number(row.total_expense));
            months.push(row.month); // month in full e.g. July
        });

        res.json({ months, earnings, expenses, profit });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch monthly summary" });
    }
};
