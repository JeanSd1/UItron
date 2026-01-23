/**
 * PASSO 4.4.5 — History Route (Read-Only)
 * 
 * GET /api/history              → últimas 20 sugestões
 * GET /api/history?limit=50     → últimas N
 * GET /api/history?mission=cleanup_system → filtrar por missão
 * GET /api/history?since=2026-01-20 → desde data
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const HISTORY_PATH = path.join(__dirname, '../../data/suggestion_history.json');

/**
 * Carregar histórico com fail-open
 */
function loadHistorySafe() {
  try {
    if (!fs.existsSync(HISTORY_PATH)) {
      return [];
    }

    const rawData = fs.readFileSync(HISTORY_PATH, 'utf8');
    if (!rawData || rawData.trim() === '') {
      return [];
    }

    const data = JSON.parse(rawData);
    return Array.isArray(data.suggestions) ? data.suggestions : [];
  } catch (err) {
    console.error(`[ERROR] Failed to load history: ${err.message}`);
    return [];
  }
}

/**
 * GET /api/history
 * Timeline de sugestões (últimas N)
 */
router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const mission = req.query.mission;
    const since = req.query.since ? new Date(req.query.since) : null;

    let suggestions = loadHistorySafe();

    // Filtrar por missão
    if (mission) {
      suggestions = suggestions.filter(s => s.mission === mission);
    }

    // Filtrar por data
    if (since) {
      suggestions = suggestions.filter(s => new Date(s.sent_at || 0) >= since);
    }

    // Ordenar por timestamp desc (mais recente primeiro)
    suggestions = suggestions
      .sort((a, b) => new Date(b.sent_at || 0) - new Date(a.sent_at || 0))
      .slice(0, limit);

    res.json({
      type: 'history_timeline',
      count: suggestions.length,
      limit,
      filters: {
        mission: mission || 'all',
        since: since ? since.toISOString() : 'all_time'
      },
      data: suggestions.map(s => ({
        suggestion_id: s.suggestion_id || null,
        mission: s.mission,
        sent_at: s.sent_at,
        reaction: s.reaction || null,
        reaction_time_minutes: s.reaction_time_minutes || null,
        reason: s.reason || null
      })),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch history',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
