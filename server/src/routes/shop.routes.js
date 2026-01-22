import express from 'express';
import { buyItem } from '../controllers/shop.controller.js';

const router = express.Router();

router.post('/shop/buy', buyItem);

export default router;
