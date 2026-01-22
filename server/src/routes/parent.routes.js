import express from 'express';
import { createChild, getChildren } from '../controllers/parent.controller.js';

const router = express.Router();

router.post('/child', createChild);
router.get('/children', getChildren);

export default router;
