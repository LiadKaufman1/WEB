import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

// Connect to DB once when the function is instantiated (cold start) or reused
connectDB();

export default app;
