// ============================================================
// Investryt AI — Express Server Entrypoint
// ============================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initKeyPools } from './services/keyPool.js';
import researchRouter from './routes/research.js';

// Load environment variables
dotenv.config();

// Initialize API Key Pools
initKeyPools();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Start Server
app.listen(PORT, () => {
  console.log(`============================================================`);
  console.log(`  Investryt AI Backend is running on http://localhost:${PORT}`);
  console.log(`============================================================`);
});
