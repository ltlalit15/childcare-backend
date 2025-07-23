// import { sendError, sendResponse } from "../utils/response.js";

import pool from "../config/db.js";
import { sendError, sendResponse } from "../utils/response.js";
import bcrypt from 'bcrypt';


// export const updatePassword = async (req, res) => {
//     const {  newPassword } = req.body;
//     const { userId } = req.params;
//       // const [[ user ]] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);

//       // const match = await bcrypt.compare(oldPassword, user.password);
//       // if (!match) return sendError(res, 400, 'password is incorrect');

//       const hashed = await bcrypt.hash(newPassword, 10);
//       await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [hashed, userId]);


//       res.json(  { message: 'Password updated successfully'})
//       // return sendResponse(res, 201, 'Password updated successfully');
   
//     };

      
       


export const updatePassword = async (req, res) => {
  const { newPassword } = req.body || {};
  const { userId } = req.params;

  if (!newPassword) return sendError(res, 400, 'New password is required');

  const hashed = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [hashed, userId]);

  return sendResponse(res, 200, 'Password updated successfully');
};

