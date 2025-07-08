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

} from '../controllers/safety.controller.js';
import upload from '../middleware/upload.middleware.js';


const router = express.Router();

// Fire Drills
router.get('/fire-drills', getFireDrills);
router.get('/fire-drills/:id', getFireDrillById);
router.post('/fire-drills', upload.single('document'), createFireDrill);
router.delete('/fire-drills/:id', deleteFireDrill);
router.patch('/fire-drills/:id', upload.single('document'), updateFireDrill); // Assuming update uses the same endpoint


// Evacuations
router.get('/evacuations', getEvacuations);
router.post('/evacuations',upload.single('document'), createEvacuation);
router.get('/evacuations/:id', getEvacuationsbyId); 
router.delete('/evacuations/:id', deleteEvacuation);
router.patch('/evacuations/:id', upload.single('document'), updateEvacuation); 




// Epipen Tracker
router.get('/epipens', getEpipens);
router.post('/epipens', createEpipen);

export default router;
