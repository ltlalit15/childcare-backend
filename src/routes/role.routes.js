import express from 'express';
import {
  createRole,
  getAllRoles,

} from '../controllers/role.controller.js';

import { verifyToken } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

router.post(
  "/",
  // verifyToken,
  // authorizeRoles("SuperAdmin"),
  createRole
);

router.get(
  "/",
  // verifyToken,
  // authorizeRoles("Admin", "SuperAdmin"),
  getAllRoles
);



export default router;
