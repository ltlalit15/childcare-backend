import express from "express";

import { getTeacherTrainingRequirements, updateTeacherTrainingRequirement, getChildrenImmunizationRequirements, updateImmunizationRequirement, filterRequirements ,getAllMaintenanceLogs,updateMaintenanceLog } from "../controllers/outstandingRequirement.controller.js";
// routes/requirementsRoutes.js
const router = express.Router();

// Get all outstanding requirements for teacher training
router.get('/teacher-training', getTeacherTrainingRequirements);

// Get all outstanding requirements for children's immunization
router.get('/children-immunization', getChildrenImmunizationRequirements);

// Update outstanding requirements for a specific teacher
router.put('/teacher-training/:teacher_name', updateTeacherTrainingRequirement);

// Update outstanding requirements for a specific child's immunization
router.put('/children-immunization/:child_id', updateImmunizationRequirement);


router.get("/location", getAllMaintenanceLogs);
router.put("/location/:id", updateMaintenanceLog);




// Filter outstanding requirements by date range //status/department/etc..
router.get('/filter', filterRequirements);
// Add more routes as needed for other outstanding requirements
export default router;

