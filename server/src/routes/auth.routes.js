import express from 'express';
import { register, checkLogin } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/check-login', checkLogin);

export default router;
