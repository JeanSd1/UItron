/**
 * PASSO 4.4.4 — Observabilidade & Sinais de Confiança
 * 
 * FASE 3: Passive Signals
 * 
 * 🚨 Detec sinais de confiança SEM ação
 * 
 * Sinais detectados (somente log):
 * - 5+ bloqueios consecutivos por policy
 * - Accept rate < 20% por missão
 * - Latência média > X minutos
 * 
 * ❌ NUNCA bloqueia
 * ❌ NUNCA altera cooldown
 * ✅ APENAS loga com event_type: observability_signal
 */

const fs = require('fs');
const path = require('path');
const { getMissionMetrics, getSystemHealthSummary } = require('./observability_metrics');
const { logInfo } = require('../config/auditLogger');

const CRITICAL_ACCEPT_RATE_THRESHOLD = 0.20; // 20%
const WARNING_LATENCY_THRESHOLD = 15; // minutos
const CRITICAL_IGNORE_STREAK = 5;

/**
 * Detectar sinais passivos em uma missão
 * 
 * @param {string} mission - Nome da missão
 * @returns {Array<Object>} Array de sinais detectados
 * 
 * Cada sinal tem:
 * {
 *   signal_type: "low_accept_rate" | "high_latency" | "high_ignore_streak",
 *   severity: "warning" | "critical",
 *   mission,
 *   value,
 *   threshold,
 *   description,
 *   timestamp
 * }
 */
function detectMissionSignals(mission) {
  if (!mission || typeof mission !== 'string') {
    return [];
  }

  const signals = [];
  const metrics = getMissionMetrics(mission);

  // Sinal 1: Accept rate crítica
  if (metrics.accept_rate !== null && metrics.accept_rate < CRITICAL_ACCEPT_RATE_THRESHOLD) {
    const signal = {
      signal_type: 'low_accept_rate',
      severity: metrics.accept_rate < 0.1 ? 'critical' : 'warning',
      mission,
      value: metrics.accept_rate,
      threshold: CRITICAL_ACCEPT_RATE_THRESHOLD,
      accepted: metrics.accepted,
      total: metrics.suggestions_total,
      description: `Taxa de aceitação ${(metrics.accept_rate * 100).toFixed(1)}% abaixo de ${CRITICAL_ACCEPT_RATE_THRESHOLD * 100}%`,
      timestamp: new Date().toISOString()
    };
    signals.push(signal);

    // Log do sinal
    logInfo({
      event_type: 'observability_signal',
      signal_type: signal.signal_type,
      severity: signal.severity,
      mission,
      value: metrics.accept_rate,
      threshold: CRITICAL_ACCEPT_RATE_THRESHOLD,
      message: signal.description
    });
  }

  // Sinal 2: Latência alta
  if (metrics.avg_reaction_time_minutes !== null && metrics.avg_reaction_time_minutes > WARNING_LATENCY_THRESHOLD) {
    const signal = {
      signal_type: 'high_latency',
      severity: metrics.avg_reaction_time_minutes > WARNING_LATENCY_THRESHOLD * 1.5 ? 'critical' : 'warning',
      mission,
      value: metrics.avg_reaction_time_minutes,
      threshold: WARNING_LATENCY_THRESHOLD,
      description: `Latência média ${metrics.avg_reaction_time_minutes.toFixed(1)}min acima de ${WARNING_LATENCY_THRESHOLD}min`,
      timestamp: new Date().toISOString()
    };
    signals.push(signal);

    // Log do sinal
    logInfo({
      event_type: 'observability_signal',
      signal_type: signal.signal_type,
      severity: signal.severity,
      mission,
      value: metrics.avg_reaction_time_minutes,
      threshold: WARNING_LATENCY_THRESHOLD,
      message: signal.description
    });
  }

  // Sinal 3: Streak de ignoradas crítica
  if (metrics.ignore_streak_atual >= CRITICAL_IGNORE_STREAK) {
    const signal = {
      signal_type: 'high_ignore_streak',
      severity: 'critical',
      mission,
      value: metrics.ignore_streak_atual,
      threshold: CRITICAL_IGNORE_STREAK,
      description: `${metrics.ignore_streak_atual} ignoradas consecutivas (limiar: ${CRITICAL_IGNORE_STREAK})`,
      timestamp: new Date().toISOString()
    };
    signals.push(signal);

    // Log do sinal
    logInfo({
      event_type: 'observability_signal',
      signal_type: signal.signal_type,
      severity: signal.severity,
      mission,
      value: metrics.ignore_streak_atual,
      threshold: CRITICAL_IGNORE_STREAK,
      message: signal.description
    });
  }

  return signals;
}

/**
 * Detectar sinais em todas as missões
 * 
 * @returns {Object} Agregação de sinais
 */
function detectAllSignals() {
  const metrics = getMissionMetrics('all'); // Placeholder
  let history = { suggestions: [] };

  try {
    const historyPath = path.join(__dirname, '../data/suggestion_history.json');
    if (fs.existsSync(historyPath)) {
      const rawData = fs.readFileSync(historyPath, 'utf8');
      if (rawData && rawData.trim()) {
        history = JSON.parse(rawData);
      }
    }
  } catch (err) {
    // Falha silent
  }

  const suggestions = Array.isArray(history.suggestions) ? history.suggestions : [];
  const missions = new Set(suggestions.map(s => s.mission).filter(m => m));

  const allSignals = [];
  for (const mission of missions) {
    const missionSignals = detectMissionSignals(mission);
    allSignals.push(...missionSignals);
  }

  // Agrupar por severidade
  const criticalSignals = allSignals.filter(s => s.severity === 'critical');
  const warningSignals = allSignals.filter(s => s.severity === 'warning');

  return {
    timestamp: new Date().toISOString(),
    total_signals: allSignals.length,
    critical_count: criticalSignals.length,
    warning_count: warningSignals.length,
    system_health: criticalSignals.length > 0 ? 'degraded' : (warningSignals.length > 0 ? 'caution' : 'nominal'),
    critical_signals: criticalSignals,
    warning_signals: warningSignals,
    all_signals: allSignals
  };
}

/**
 * Gerar relatório de sinais (para dashboard/CLI)
 * 
 * @returns {Object} Relatório formatado
 */
function generateSignalReport() {
  const signals = detectAllSignals();
  const health = getSystemHealthSummary();

  return {
    report_timestamp: new Date().toISOString(),
    system_health: health.system_status,
    missions_analyzed: health.total_missions,
    signals_detected: signals.total_signals,
    critical_alerts: signals.critical_count,
    warning_alerts: signals.warning_count,
    system_status: signals.system_health,
    critical_details: signals.critical_signals,
    warning_details: signals.warning_signals
  };
}

module.exports = {
  detectMissionSignals,
  detectAllSignals,
  generateSignalReport,
  CRITICAL_ACCEPT_RATE_THRESHOLD,
  WARNING_LATENCY_THRESHOLD,
  CRITICAL_IGNORE_STREAK
};
