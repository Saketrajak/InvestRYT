// ============================================================
// Investryt AI — Express Application (shared for local + Vercel)
// ============================================================
// Creates and configures the Express app, but does NOT listen.
// This allows both local dev (index.ts) and Vercel (api/index.ts)
// to use the same app instance.

import dotenv from 'dotenv';
dotenv.config(); // Must run before initKeyPools

import express from 'express';
import cors from 'cors';
import { initKeyPools } from './services/keyPool.js';
import researchRouter from './routes/research.js';

// Initialize API Key Pools
initKeyPools();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // In production, limit this to frontend domain
}));
app.use(express.json());

// Routes
app.use('/api', researchRouter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Investryt AI Backend' });
});

export default app;
