
import { pool } from '../config/db.js';

export const checkPermission = (module, action) => {
  return async (req, res, next) => {
    const userId = req.user.user_id;
    const [[user]] = await pool.query(
      `SELECT r.permissions_json FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?`,
      [userId]
    );

    if (!user || !user.permissions_json) {
      return res.status(403).json({ message: "No role or permissions assigned." });
    }

    const permissions = JSON.parse(user.permissions_json);
    if (permissions[module] && permissions[module][action]) {
      return next();
    }

    return res.status(403).json({ message: "Permission denied." });
  };
};
