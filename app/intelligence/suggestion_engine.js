const { loadProfile } = require('./user_profile');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

const HISTORY_PATH = path.join(__dirname, '..', 'missions', 'history.json');

function loadHistory(limit = 10) {
  if (!fs.existsSync(HISTORY_PATH)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8'));
    // Normalização defensiva de timestamps
    let normalized = Array.isArray(data) ? data : [];
    normalized = normalized.filter(h => {
      if (!h.timestamp || isNaN(Date.parse(h.timestamp))) {
        logger.warn('history_read_fail', {
          event_type: 'history_read_fail',
          reason: 'Invalid or missing timestamp in history',
          suggestion_id: h.suggestion_id || null,
          mission: h.mission || null,
          timestamp: h.timestamp || null
        });
        return false;
      }
      if (new Date(h.timestamp) > new Date()) {
        logger.warn('history_read_fail', {
          event_type: 'history_read_fail',
          reason: 'Timestamp in the future',
          suggestion_id: h.suggestion_id || null,
          mission: h.mission || null,
          timestamp: h.timestamp
        });
        return false;
      }
      h.timestamp = new Date(h.timestamp).toISOString();
      return true;
    });
    return normalized.slice(-limit);
  } catch (err) {
    logger.warn('history_read_fail', {
      event_type: 'history_read_fail',
      reason: err.message,
      timestamp: new Date().toISOString()
    });
    return [];
  }
}

function generateSuggestions() {
  const profile = loadProfile();
  const history = loadHistory(10);

  const suggestions = [];

  // Exemplo 1: cleanup_system recorrente
  const cleanupHistory = history.filter(h => h.mission === 'cleanup_system');

  if (cleanupHistory.length >= 2) {
    const confidence = profile.missions?.cleanup_system?.confidence ?? null;

    if (confidence !== null && confidence >= 0.7) {
      suggestions.push({
        mission: 'cleanup_system',
        reason: 'Você costuma autorizar a limpeza quando há acúmulo recorrente',
        confidence,
        recommended_time: profile.preferences?.notification_window?.start || '09:00',
        severity: 'low'
      });
    }
  }

  return suggestions;
}

module.exports = {
  generateSuggestions
};
