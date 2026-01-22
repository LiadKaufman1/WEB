import express from 'express';
import { getStats, updateScore, getFieldFrequency, recordMistake } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/user/stats', getStats);
router.post('/score/:field', updateScore);
router.post('/score/:field/mistake', recordMistake);
router.get('/user/:field-f', getFieldFrequency);

export default router;
