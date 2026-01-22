/**
 * PASSO 4.4.4 — Observabilidade & Sinais de Confiança
 * 
 * FASE 1: Métricas Agregadas por Missão
 * 
 * 🔒 REGRA DE OURO: Somente leitura + fail-open + sem efeito colateral
 * 
 * Expõe por missão:
 * - suggestions_total
 * - accepted
 * - denied (bloqueadas)
 * - ignored
 * - accept_rate
 * - ignore_streak_atual
 * - avg_reaction_time_minutes
 * - last_suggested_at
 * - last_decision_reason
 * 
 * Fonte única: suggestion_history.json
 * Falha: retorna estrutura vazia (fail-open)
 */

const fs = require('fs');
const path = require('path');
const { logInfo } = require('../config/auditLogger');

const HISTORY_PATH = path.join(__dirname, '../data/suggestion_history.json');

/**
 * Carregar histórico com fail-open
 * Herdado do PASSO 4.4.3
 */
function loadHistorySafe() {
  try {
    if (!fs.existsSync(HISTORY_PATH)) {
      return { suggestions: [] };
    }

    const rawData = fs.readFileSync(HISTORY_PATH, 'utf8');
    if (!rawData || rawData.trim() === '') {
      return { suggestions: [] };
    }

    const data = JSON.parse(rawData);
    return Array.isArray(data.suggestions) ? data : { suggestions: [] };
  } catch (err) {
    logInfo({
      event_type: 'observability_history_read_fail',
      message: `Failed to load history for metrics: ${err.message}`,
      severity: 'low'
    });
    return { suggestions: [] };
  }
}

/**
 * Obter métricas de uma missão específica
 * 
 * @param {string} mission - Nome da missão
 * @returns {Object} Métricas agregadas
 * 
 * Exemplo:
 * {
 *   mission: "cleanup_system",
 *   suggestions_total: 10,
 *   accepted: 7,
 *   denied: 2,
 *   ignored: 1,
 *   accept_rate: 0.7,
 *   ignore_streak_atual: 1,
 *   avg_reaction_time_minutes: 5.2,
 *   last_suggested_at: "2026-01-21T12:00:00Z",
 *   last_decision_reason: "ok",
 *   status: "healthy" | "warning" | "critical"
 * }
 */
function getMissionMetrics(mission) {
  if (!mission || typeof mission !== 'string') {
    return { error: 'invalid_mission_param', mission: null };
  }

  const history = loadHistorySafe();
  const missionSuggestions = history.suggestions.filter(s => s.mission === mission);

  if (missionSuggestions.length === 0) {
    return {
      mission,
      suggestions_total: 0,
      accepted: 0,
      denied: 0,
      ignored: 0,
      accept_rate: null,
      ignore_streak_atual: 0,
      avg_reaction_time_minutes: null,
      last_suggested_at: null,
      last_decision_reason: null,
      status: 'no_data'
    };
  }

  // Ordenar por timestamp
  const sorted = missionSuggestions.sort(
    (a, b) => new Date(a.sent_at || 0) - new Date(b.sent_at || 0)
  );

  // Contar reações
  const accepted = sorted.filter(s => s.reaction === 'accepted').length;
  const ignored = sorted.filter(s => s.reaction === 'ignored').length;
  const denied = sorted.filter(s => s.reaction === 'denied').length;
  const total = sorted.length;

  // Taxa de aceitação
  const acceptRate = total > 0 ? accepted / total : null;

  // Sequência de ignoradas consecutivas (começando do final)
  let ignoreStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].reaction === 'ignored') {
      ignoreStreak++;
    } else {
      break;
    }
  }

  // Latência média (apenas aceitas)
  const acceptedWithLatency = sorted.filter(
    s => s.reaction === 'accepted' && s.reaction_time_minutes !== null
  );
  const avgLatency = acceptedWithLatency.length > 0
    ? acceptedWithLatency.reduce((sum, s) => sum + s.reaction_time_minutes, 0) / acceptedWithLatency.length
    : null;

  // Última sugestão
  const lastSuggestion = sorted[sorted.length - 1];

  // Determinar status baseado em sinais
  let status = 'healthy';
  if (acceptRate !== null && acceptRate < 0.3) {
    status = 'critical';
  } else if (ignoreStreak >= 5) {
    status = 'critical';
  } else if (acceptRate !== null && acceptRate < 0.5) {
    status = 'warning';
  } else if (ignoreStreak >= 3) {
    status = 'warning';
  }

  return {
    mission,
    suggestions_total: total,
    accepted,
    denied,
    ignored,
    accept_rate: acceptRate,
    ignore_streak_atual: ignoreStreak,
    avg_reaction_time_minutes: avgLatency,
    last_suggested_at: lastSuggestion.sent_at || null,
    last_decision_reason: lastSuggestion.reason || null,
    status
  };
}

/**
 * Obter métricas de todas as missões
 * 
 * @returns {Array<Object>} Array de métricas por missão
 */
function getAllMissionsMetrics() {
  const history = loadHistorySafe();
  
  if (history.suggestions.length === 0) {
    return [];
  }

  // Encontrar missões únicas
  const missions = new Set(history.suggestions.map(s => s.mission).filter(m => m));

  return Array.from(missions)
    .map(mission => getMissionMetrics(mission))
    .sort((a, b) => (b.suggestions_total || 0) - (a.suggestions_total || 0));
}

/**
 * Sumário geral de saúde do sistema
 * 
 * @returns {Object} Agregação de todos os sinais
 */
function getSystemHealthSummary() {
  const allMetrics = getAllMissionsMetrics();

  if (allMetrics.length === 0) {
    return {
      total_missions: 0,
      total_suggestions: 0,
      healthy_missions: 0,
      warning_missions: 0,
      critical_missions: 0,
      overall_accept_rate: null,
      system_status: 'no_data'
    };
  }

  const totalSuggestions = allMetrics.reduce((sum, m) => sum + m.suggestions_total, 0);
  const totalAccepted = allMetrics.reduce((sum, m) => sum + m.accepted, 0);
  const overallAcceptRate = totalSuggestions > 0 ? totalAccepted / totalSuggestions : null;

  const healthyCount = allMetrics.filter(m => m.status === 'healthy').length;
  const warningCount = allMetrics.filter(m => m.status === 'warning').length;
  const criticalCount = allMetrics.filter(m => m.status === 'critical').length;

  let systemStatus = 'healthy';
  if (criticalCount > 0) {
    systemStatus = 'critical';
  } else if (warningCount > 0) {
    systemStatus = 'warning';
  }

  return {
    total_missions: allMetrics.length,
    total_suggestions: totalSuggestions,
    healthy_missions: healthyCount,
    warning_missions: warningCount,
    critical_missions: criticalCount,
    overall_accept_rate: overallAcceptRate,
    system_status: systemStatus,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  getMissionMetrics,
  getAllMissionsMetrics,
  getSystemHealthSummary,
  loadHistorySafe
};
