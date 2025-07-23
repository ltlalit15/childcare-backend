import express from 'express';
import {
  getFireDrills,
  createFireDrill,
  getEvacuations,
  createEvacuation,
  getEpipens,
  createEpipen,
  getFireDrillById,
  deleteFireDrill,
  updateFireDrill,
  getEvacuationsbyId,
  updateEvacuation,
  deleteEvacuation
  , deleteEpipen,
  updateEpipen,
  createSleepLog,
  updateSleepLog,
  deleteSleepLog,
  getSleepLogs,
  addDiaperLog,
  getAllDiaperLogs,
  updateDiaperLog,
  deleteDiaperLog,
  getAllMaintenanceLogs,
  addMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,


} from '../controllers/safety.controller.js';
import upload from '../middleware/upload.middleware.js';


const router = express.Router();

// Fire Drills
router.get('/fire-drills', getFireDrills);
router.get('/fire-drills/:id', getFireDrillById);
router.post('/fire-drills', upload.single('document'), createFireDrill);
router.delete('/fire-drills/:id', deleteFireDrill);
router.patch('/fire-drills/:id', upload.single('document'), updateFireDrill);


// Evacuations
router.get('/evacuations', getEvacuations);
router.post('/evacuations', upload.single('document'), createEvacuation);
router.get('/evacuations/:id', getEvacuationsbyId);
router.delete('/evacuations/:id', deleteEvacuation);
router.patch('/evacuations/:id', upload.single('document'), updateEvacuation);




// Epipen Tracker
router.get('/epipens', getEpipens);
router.post('/epipens', createEpipen);
router.delete('/epipens/:id', deleteEpipen);
router.put('/epipens/:id', updateEpipen);


//sleep logs
router.post('/sleep-logs', createSleepLog);
router.put('/sleep-logs/:id', updateSleepLog);
router.delete('/sleep-logs/:id', deleteSleepLog);
router.get('/sleep-logs', getSleepLogs);


//Diaper Logs
router.post("/diaper-logs", addDiaperLog);
router.get("/diaper-logs", getAllDiaperLogs);
router.put("/diaper-logs/:id", updateDiaperLog);
router.delete("/diaper-logs/:id", deleteDiaperLog);



// Maintenance Logs
router.get('/maintenance-logs', getAllMaintenanceLogs);
router.post('/maintenance-logs', addMaintenanceLog);
router.put('/maintenance-logs/:id', updateMaintenanceLog);
router.delete('/maintenance-logs/:id', deleteMaintenanceLog);
export default router;
