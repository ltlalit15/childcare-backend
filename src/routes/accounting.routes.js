import express from "express";
import { addTransaction, getAllTransactions, deleteTransaction, updateTransaction, addCategory, getAllMonthlySummary, getMonthlySummary } from "../controllers/accounting.controller.js";

const router = express.Router();

// Add new transaction
router.post("/transactions", addTransaction);

// Get all transactions
router.get("/transactions", getAllTransactions);
// Delete a transaction by ID
router.delete("/transactions/:id", deleteTransaction);

// Update a transaction by ID
router.put("/transactions/:id", updateTransaction);

// Filter transactions by type
// router.get("/transactions/filter", filterTransactions);


// Add a new category   
router.post("/categories", addCategory);

router.get("/monthly-summary", getAllMonthlySummary);

// Get monthly summary  
router.get("/monthly-summary", getMonthlySummary);




export default router;
