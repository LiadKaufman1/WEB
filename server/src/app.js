import express from 'express';
import cors from 'cors';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import shopRoutes from './routes/shop.routes.js';
import adminRoutes from './routes/admin.routes.js';
import parentRoutes from './routes/parent.routes.js';

const app = express();

// Middleware
app.use(cors()); // Allow all origins for now, or restrict to localhost:5173
app.use(express.json());

// Mount Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', shopRoutes);
app.use('/api', adminRoutes);
app.use('/api', parentRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/api/ping', (req, res) => {
    res.json({ msg: "pong", version: "v9-refactored", time: new Date() });
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ error: "Route not found" });
});

// Global Error Handler
import { errorHandler } from './middleware/errorHandler.js';
app.use(errorHandler);

export default app;
