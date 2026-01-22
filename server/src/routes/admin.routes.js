import express from 'express';
import { getParentData } from '../controllers/admin.controller.js';

const router = express.Router();

router.post('/parents/data', getParentData);
router.post('/get_parents', getParentData); // Alias support

export default router;
