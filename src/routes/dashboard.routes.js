import express from 'express';
import {
    addActivity,
    getAllActivities,
    getActivityById,
    updateActivity,
    deleteActivity,
    getChildrenStats,
    getTeacherStats
} from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get('/children-stats', getChildrenStats);
router.get('/teacher-stats', getTeacherStats);


// Add new activity
router.post('/', addActivity);

// Get all activities
router.get('/', getAllActivities);

// Get a single activity by ID
router.get('/:id', getActivityById);

router.patch("/:id", updateActivity);

router.delete('/:id', deleteActivity);

export default router;
