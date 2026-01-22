/**
 * PASSO 5.1.1 — Voice Logger (Audit Trail)
 * 
 * Centralized logging for all voice events
 * Structured, deterministic, audit-grade
 */

const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../logs/ultron_voice.log');

/**
 * Ensure logs directory exists
 */
function ensureLogDirectory() {
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

/**
 * Log voice event with schema
 */
function auditLog(eventData) {
  try {
    ensureLogDirectory();

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: eventData.level || 'INFO',
      event_type: eventData.event_type || 'unknown',
      ...eventData
    };

    // Append to log file (fail-open)
    try {
      fs.appendFileSync(
        LOG_FILE,
        JSON.stringify(logEntry) + '\n',
        'utf8'
      );
    } catch (writeErr) {
      console.error('[VOICE_LOG_ERROR]', writeErr.message);
      // Fail-open: don't crash on write error
    }

    // Console output (structured)
    if (process.env.VOICE_DEBUG) {
      console.log(`[${logEntry.event_type}]`, logEntry);
    }

    return logEntry;
  } catch (err) {
    console.error('[AUDIT_LOG_ERROR]', err.message);
    // Fail-open: always return something
    return { error: err.message };
  }
}

/**
 * Read logs (read-only, no modification)
 */
function readLogs(filter = {}) {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return [];
    }

    const content = fs.readFileSync(LOG_FILE, 'utf8');
    const lines = content.trim().split('\n').filter(l => l);

    return lines
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(entry => {
        if (!entry) return false;
        if (filter.event_type && entry.event_type !== filter.event_type) {
          return false;
        }
        if (filter.since && new Date(entry.timestamp) < new Date(filter.since)) {
          return false;
        }
        return true;
      });
  } catch (err) {
    console.error('[READ_LOGS_ERROR]', err.message);
    return [];
  }
}

/**
 * Get voice session statistics
 */
function getVoiceStats() {
  try {
    const logs = readLogs();

    const stats = {
      total_events: logs.length,
      successful_transcriptions: logs.filter(l => l.event_type === 'transcription_success').length,
      blocked_commands: logs.filter(l => l.event_type === 'intent_routing_blocked').length,
      unrecognized_intents: logs.filter(l => l.event_type === 'intent_routing_unrecognized').length,
      average_processing_time_ms: 0,
      status: 'ok'
    };

    const processingTimes = logs
      .filter(l => l.processing_time_ms)
      .map(l => l.processing_time_ms);

    if (processingTimes.length > 0) {
      stats.average_processing_time_ms = Math.round(
        processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
      );
    }

    return stats;
  } catch (err) {
    return { error: err.message, status: 'error' };
  }
}

module.exports = {
  auditLog,
  readLogs,
  getVoiceStats
};
