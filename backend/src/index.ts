// ============================================================
// Investryt AI — Express Server Entrypoint (local dev only)
// ============================================================
// For local development. Vercel uses api/index.ts instead.

import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`============================================================`);
  console.log(`  Investryt AI Backend is running on http://localhost:${PORT}`);
  console.log(`============================================================`);
});
