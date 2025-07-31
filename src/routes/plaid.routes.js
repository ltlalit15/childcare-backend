import express from "express";
import {
  createLinkToken,
  exchangePublicToken,
  getTransactions,
  addBankInfo,
} from "../controllers/plaidController.js";

const router = express.Router();

router.post("/create-link-token", createLinkToken);
router.post("/exchange-public-token", exchangePublicToken);
router.post("/transactions", getTransactions);
router.post("/add-bank-info", addBankInfo);

export default router
