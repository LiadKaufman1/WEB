import express from 'express';
import mathBotController from '../controllers/mathBotController.js';

const router = express.Router();

router.post('/hint', mathBotController.getHint);

export default router;
