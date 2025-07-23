import express from 'express';

import { createCampaign, getCampaignSummary, updateCampaign, deleteCampaign, uploadContactsFromCSV, addContact, updateContact, deleteContact, getAllContacts, getRecentCallLogs, insertCallLog, getAllCampaigns } from '../controllers/callCenter.controller.js';
import { upload } from '../middleware/upload.middleware.js';
import uploadCSV from "../middleware/upload.csv.middleware.js"

const router = express.Router();

// for file upload only when message_type = "Voice Recording"
router.post('/campaigns', upload.single('voice_file'), createCampaign);
router.get('/campaigns', getAllCampaigns);
router.get('/campaigns/summary', getCampaignSummary);
router.put('/campaigns/:id', upload.single('voice_file'), updateCampaign);
router.delete('/campaigns/:id', deleteCampaign);
router.post('/contacts', addContact);
router.put('/contacts/:id', updateContact);
router.delete('/contacts/:id', deleteContact);
router.get('/contacts', getAllContacts);
router.get('/calls/recent', getRecentCallLogs);
router.post('/calls/log', insertCallLog);
router.post('/upload-contacts', uploadCSV.single('file'), uploadContactsFromCSV);
export default router;
