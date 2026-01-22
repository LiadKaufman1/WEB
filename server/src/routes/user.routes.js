import express from 'express';
import { getStats, updateScore, getFieldFrequency } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/user/stats', getStats);
router.post('/score/:field', updateScore);
router.get('/user/:field-f', getFieldFrequency);

export default router;
