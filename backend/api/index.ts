// ============================================================
// Investryt AI — Vercel Serverless Entrypoint
// ============================================================
// Exports the Express app as a Vercel serverless function.
// Vercel's @vercel/node runtime handles the TypeScript compilation.

import app from '../src/app.js';
export default app;
