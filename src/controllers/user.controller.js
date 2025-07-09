import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { sendError, sendResponse } from '../utils/response.js';

export const registerUser = async (req, res) => {
  const { first_name, last_name, email, password, role_id, status  } = req.body;
  const hashed = await bcrypt.hash(password, 10);

     const [[existingUser]] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

   const [ result] = await pool.query(
    "INSERT INTO users (first_name, last_name, email, password, role_id, status ) VALUES (?, ?, ?, ?, ?, ?)",
    [first_name, last_name, email, hashed, role_id, status ]
  );
  
   return sendResponse(res, 201, "User registered successfully", {
        user_id: result.insertId,
        first_name,
        last_name,
        email,
        role_id,
        status,
      },
     );
  
};

export const getUsers  = async( req, res) => {

  try {
   const [rows] = await pool.query(`
      SELECT 
        users.*, 
        roles.name 
      FROM users
      LEFT JOIN roles ON users.role_id = roles.role_id
    `);

    return sendResponse(res, 200, "Users retrieved successfully", rows);
  } catch (error) {
    console.error("Get users failed:", error);
    return sendError(res, 500, "Failed to retrieve users", error.message);

    
  }
  
}

export const getUserById = async (req, res) => {
  const { user_id } = req.params;
  try{
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [user_id]);
    if (rows.length === 0) {

      return res.status(404).json({ message: "User not found" });
    }
    return sendResponse(res, 200, "User retrieved successfully", rows[0]);
  } catch (error) {
   
    console.error("Get user failed:", error);

    return sendError(res, 500, "Failed to retrieve user", error.message);
  }

  }
  

  export const updateUser = async (req, res) => {
  const { user_id } = req.params;
  const { first_name, last_name, email, role_id, status } = req.body;

  try {
    // 1. Check if user exists
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [user_id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Update the user
    await pool.query(
      `UPDATE users 
       SET first_name = ?, last_name = ?, email = ?, role_id = ?, status = ?
       WHERE user_id = ?`,
      [first_name, last_name, email, role_id, status, user_id]
    );

    // 3. Return success response
    return sendResponse(res, 200, "User updated successfully", {
      user_id,
      first_name,
      last_name,
      email,
      role_id,
      status,
    });

  } catch (error) {
    console.error("Update user failed:", error);
    return sendError(res, 500, "Failed to update user", error.message);
  }
};

 


export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const [[user]] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  if (!user) return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Incorrect password" });

  const token = jwt.sign(
    { user_id: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  res.json({ token, user });
};
