import express from 'express';
import cors from 'cors';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import shopRoutes from './routes/shop.routes.js';
import adminRoutes from './routes/admin.routes.js';
import parentRoutes from './routes/parent.routes.js';
import aiRoutes from './routes/ai.routes.js';

const app = express();

// Middleware
// Middleware
app.use(cors());
app.use(express.json());

// Vercel path normalization: strip /api if present so routes match cleanly
app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
        req.url = req.url.replace('/api', '') || '/';
    }
    next();
});

// Mount Routes (at root, since we stripped /api)
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', shopRoutes);
app.use('/', adminRoutes);
app.use('/', parentRoutes);
app.use('/ai', aiRoutes);

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
