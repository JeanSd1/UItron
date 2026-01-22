/**
 * PASSO 4.4.5 — Dashboard Backend
 * 
 * 🛡️ Read-Only API Server
 * 
 * Endpoints:
 * - GET /api/metrics           → todas as missões
 * - GET /api/metrics/:mission  → métrica específica
 * - GET /api/decisions         → decisões com explicações
 * - GET /api/history           → timeline de sugestões
 * - GET /                      → UI estática
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir UI estática
app.use(express.static(path.join(__dirname, 'ui')));

// Importar routes read-only
const metricsRouter = require('./routes/metrics');
const decisionsRouter = require('./routes/decisions');
const historyRouter = require('./routes/history');

// Registrar rotas
app.use('/api/metrics', metricsRouter);
app.use('/api/decisions', decisionsRouter);
app.use('/api/history', historyRouter);

// Health check (read-only)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: 'read-only',
    message: 'Dashboard observability server running'
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ error: err.message });
});

// Iniciar servidor
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Dashboard Server Running (Read-Only Mode)`);
    console.log(`   URL: http://localhost:${PORT}`);
    console.log(`   Mode: Observability Read-Only\n`);
    console.log(`   Endpoints:`);
    console.log(`   - GET /               → Dashboard UI`);
    console.log(`   - GET /api/health     → Health check`);
    console.log(`   - GET /api/metrics    → Métricas (todas as missões)`);
    console.log(`   - GET /api/decisions  → Decisões + explicações`);
    console.log(`   - GET /api/history    → Timeline de sugestões\n`);
  });
}

module.exports = app;
