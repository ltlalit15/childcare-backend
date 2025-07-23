import { pool } from '../config/db.js';

export const addBankInfo = async (req, res) => {
  const { bank_name, account_number, routing_number, plaid_token } = req.body;

  if (!bank_name || !account_number || !routing_number) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  await pool.query(
    `INSERT INTO bank_info (bank_name, account_number, routing_number, plaid_token)
     VALUES (?, ?, ?, ?)`,
    [bank_name, account_number, routing_number, plaid_token]
  );

  res.status(201).json({ message: "Bank Info saved." });
};

export const getBankInfo = async (req, res) => {
  const [rows] = await pool.query(`SELECT * FROM bank_info`);
  res.json(rows);
};
