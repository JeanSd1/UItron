/**
 * PASSO 4.4.5 — Decisões Route (Read-Only)
 * 
 * GET /api/decisions             → todas as decisões com explicações
 * GET /api/decisions?mission=cleanup_system → apenas uma missão
 */

const express = require('express');
const { explainLastDecision, explainAllDecisions } = require('../../intelligence/decision_explainer');

const router = express.Router();

/**
 * GET /api/decisions
 * Retorna explicação de última decisão por missão
 */
router.get('/', (req, res) => {
  try {
    const mission = req.query.mission;

    if (mission) {
      // Decisão específica
      const explain = explainLastDecision(mission);
      return res.json({
        type: 'single_decision',
        data: explain,
        timestamp: new Date().toISOString()
      });
    }

    // Todas as decisões
    const allDecisions = explainAllDecisions();

    res.json({
      type: 'all_decisions',
      count: allDecisions.length,
      data: allDecisions,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch decisions',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/decisions/:mission
 * Explicação de decisão de uma missão específica
 */
router.get('/:mission', (req, res) => {
  try {
    const mission = req.params.mission;

    if (!mission) {
      return res.status(400).json({ error: 'mission parameter required' });
    }

    const explain = explainLastDecision(mission);

    res.json({
      type: 'single_decision',
      data: explain,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch decision explanation',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
