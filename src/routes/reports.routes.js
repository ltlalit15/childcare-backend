import express from 'express';
import { getMonthlySummary, getMonthlyComparison } from '../controllers/reports.controller.js';

const router = express.Router();

router.get('/monthly-summary', getMonthlySummary);
router.get('/monthly-comparison', getMonthlyComparison);

export default router;
