/**
 * PASSO 4.4.3 — FASE 2: Hardening de Logs
 * 
 * Schema único por evento:
 * {
 *   event_type: "suggestion_policy_decision",
 *   suggestion_id: "...",
 *   mission: "...",
 *   decision: "allowed | blocked",
 *   reason: "...",
 *   next_allowed_at: "...",
 *   timestamp: "ISO"
 * }
 * 
 * Níveis:
 * - INFO: operação normal
 * - DECISION: decisões de policy
 * - WARN: fallback / edge case
 * - POLICY: auditoria de política
 */

const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '..', 'logs', 'ultron.log');

/**
 * Schema único para evento de decisão de sugestão
 * Garantir correlação total via suggestion_id
 */
function logDecisionEvent(eventData) {
  const {
    event_type = 'suggestion_policy_decision',
    suggestion_id,
    mission,
    decision, // 'allowed' | 'blocked'
    reason,
    next_allowed_at = null,
    level = 'DECISION'
  } = eventData;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event_type,
    suggestion_id: suggestion_id || null,
    mission: mission || null,
    decision,
    reason,
    next_allowed_at,
    audit_id: `${suggestion_id}-${Date.now()}` // Correlação única
  };

  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n', { encoding: 'utf8' });
  return entry;
}

/**
 * Log de falha na leitura do histórico (WARN level)
 */
function logHistoryReadFailure(failureData) {
  const {
    reason,
    suggestion_id = null,
    mission = null,
    timestamp = null
  } = failureData;

  const entry = {
    timestamp: new Date().toISOString(),
    level: 'WARN',
    event_type: 'history_read_fail',
    suggestion_id,
    mission,
    reason,
    recovery: 'fail_open_enabled'
  };

  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n', { encoding: 'utf8' });
  return entry;
}

/**
 * Log de policy approval (POLICY level para auditoria)
 */
function logPolicyDecision(policyData) {
  const {
    suggestion_id,
    mission,
    policy_name, // e.g., 'ignore_streak_5x', 'low_acceptance_rate'
    decision, // 'allowed' | 'blocked'
    metrics = {},
    next_allowed_at = null
  } = policyData;

  const entry = {
    timestamp: new Date().toISOString(),
    level: 'POLICY',
    event_type: 'suggestion_policy_decision',
    suggestion_id,
    mission,
    policy_name,
    decision,
    metrics,
    next_allowed_at,
    audit_correlation: `${suggestion_id}-${mission}-${policy_name}`
  };

  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n', { encoding: 'utf8' });
  return entry;
}

/**
 * Log informativo de operação normal (INFO level)
 */
function logInfo(infoData) {
  const {
    event_type,
    message,
    suggestion_id = null,
    mission = null,
    details = {}
  } = infoData;

  const entry = {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    event_type,
    message,
    suggestion_id,
    mission,
    ...details
  };

  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n', { encoding: 'utf8' });
  return entry;
}

module.exports = {
  logDecisionEvent,
  logHistoryReadFailure,
  logPolicyDecision,
  logInfo
};
