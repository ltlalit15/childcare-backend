import express from 'express';
import {
  addBankInfo,
  getBankInfo
} from '../controllers/bank.controller.js';

import { verifyToken } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

router.post(
  "/",
//   verifyToken,
//   authorizeRoles("Admin"),
  addBankInfo
);

router.get(
  "/",
//   verifyToken,
//   authorizeRoles("Admin"),
  getBankInfo
);

export default router;
