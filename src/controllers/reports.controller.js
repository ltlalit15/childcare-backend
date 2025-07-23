import pool from '../config/db.js';

export const getMonthlySummary = async (req, res) => {
    const { year, month } = req.query;

    if (!year) return res.status(400).json({ error: 'Year is required' });

    try {
        let query = `
      SELECT 
        MONTHNAME(date) AS month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - 
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS profit
      FROM accounting
      WHERE YEAR(date) = ?
    `;

        const params = [year];

        if (month) {
            query += ` AND MONTHNAME(date) = ?`;
            params.push(month.charAt(0).toUpperCase() + month.slice(1).toLowerCase());
        }

        query += ` GROUP BY MONTH(date) ORDER BY MONTH(date)`;

        const [rows] = await pool.query(query, params);
        res.json({ data: rows });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



export const getMonthlyComparison = async (req, res) => {
    const { year } = req.query;
    if (!year) return res.status(400).json({ error: "Year is required" });

    try {
        const query = `
      SELECT 
        MONTH(date) as month_number,
        MONTHNAME(date) as month,
        YEAR(date) as year,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
      FROM accounting
      WHERE YEAR(date) = ?
      GROUP BY YEAR(date), MONTH(date)
      ORDER BY YEAR(date) DESC, MONTH(date) DESC
    `;

        const [rows] = await pool.query(query, [year]);

        const result = [];

        for (let i = 0; i < rows.length; i++) {
            const curr = rows[i];
            const prev = rows[i + 1]; // next row is previous month due to DESC

            const netSavings = curr.income - curr.expense;

            let incomeChange = null;
            let expenseChange = null;

            if (prev) {
                incomeChange =
                    prev.income === 0 ? null : (((curr.income - prev.income) / prev.income) * 100).toFixed(1);
                expenseChange =
                    prev.expense === 0 ? null : (((curr.expense - prev.expense) / prev.expense) * 100).toFixed(1);
            }

            result.push({
                month: `${curr.month} ${curr.year}`,
                income: curr.income,
                expense: curr.expense,
                savings: netSavings,
                changeFromLastMonth: incomeChange !== null && expenseChange !== null
                    ? `${incomeChange > 0 ? '+' : ''}${incomeChange}% Income, ${expenseChange > 0 ? '+' : ''}${expenseChange}% Expenses`
                    : "N/A"
            });
        }

        res.json({ data: result });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
