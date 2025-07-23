import  pool  from "../config/db.js";
import { sendResponse } from "../utils/response.js";

export const createRole = async (req, res) => {
  const { role_name } = req.body;

  if (!role_name) {
    return res.status(400).json({ message: "Name required" });
  }

  try {
    // Insert role into DB
    const [result] = await pool.query(
      `INSERT INTO roles (role_name) VALUES (?)`,
      [role_name]
    );

    const roleId = result.insertId;

    // Fetch the full row from DB
    const [rows] = await pool.query(
      `SELECT * FROM roles WHERE role_id = ?`,
      [roleId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Role not found after insert" });
    }

    return sendResponse(
      res,
      201,
      "Role created successfully",
      rows[0] // return the inserted row
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const getAllRoles = async (req, res) => {
  const [rows] = await pool.query(`SELECT * FROM roles`);
  res.json(rows);
};

// export const updateRolePermissions = async (req, res) => {
//   const { role_id } = req.params;
// //   const { permissions } = req.body;

//   await pool.query(
//     `UPDATE roles SET permissions_json = ? WHERE role_id = ?`,
//     [JSON.stringify(permissions), role_id]
//   );

//   res.json({ message: "Permissions updated." });
// };
