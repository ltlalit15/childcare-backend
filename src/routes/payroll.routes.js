import express from "express";
import {
    addEmployee,
    getAllEmployees,
    addPayrollEntry,
    getAllPayrollEntries,
    updatePayrollEntry,
    deletePayrollEntry,
    getPayrollSummary
} from "../controllers/payroll.controller.js";

const router = express.Router();

// Employee Routes
router.post("/add-emp", addEmployee);
router.get("/get-all-emp", getAllEmployees);

// Payroll Routes
router.post("/", addPayrollEntry);
router.get("/", getAllPayrollEntries);
router.patch("/:id", updatePayrollEntry);
router.delete("/:id", deletePayrollEntry);
router.get('/summary', getPayrollSummary);
export default router;
