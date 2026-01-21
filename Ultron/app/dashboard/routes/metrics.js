/**
 * PASSO 4.4.5 — Métricas Route (Read-Only)
 * 
 * GET /api/metrics             → todas as missões
 * GET /api/metrics/cleanup_system → métrica específica
 * GET /api/metrics?mission=cleanup_system (alternativo)
 */

const express = require('express');
const {
  getMissionMetrics,
  getAllMissionsMetrics,
  getSystemHealthSummary
} = require('../../intelligence/observability_metrics');

const router = express.Router();

/**
 * GET /api/metrics
 * Retorna todas as métricas ou apenas uma missão
 */
router.get('/', (req, res) => {
  try {
    const mission = req.query.mission;

    if (mission) {
      // Métrica específica
      const metrics = getMissionMetrics(mission);
      return res.json({
        type: 'single_mission',
        data: metrics,
        timestamp: new Date().toISOString()
      });
    }

    // Todas as missões + sumário de saúde
    const allMetrics = getAllMissionsMetrics();
    const health = getSystemHealthSummary();

    res.json({
      type: 'all_missions',
      summary: health,
      missions: allMetrics,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch metrics',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/metrics/:mission
 * Métrica de uma missão específica
 */
router.get('/:mission', (req, res) => {
  try {
    const mission = req.params.mission;

    if (!mission) {
      return res.status(400).json({ error: 'mission parameter required' });
    }

    const metrics = getMissionMetrics(mission);

    res.json({
      type: 'single_mission',
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch metrics',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
