/**
 * PASSO 4.4.4 — Observabilidade & Sinais de Confiança
 * 
 * FASE 2: Decision Explainer
 * 
 * 🔒 REGRA: Nunca recalcula policy
 * ✅ Apenas explica o que já aconteceu
 * 
 * Função:
 * explainLastDecision(mission)
 * 
 * Retorno determinístico, baseado em dados reais do histórico
 */

const fs = require('fs');
const path = require('path');
const { getMissionMetrics } = require('./observability_metrics');
const { logInfo } = require('../config/auditLogger');

const HISTORY_PATH = path.join(__dirname, '../data/suggestion_history.json');

/**
 * Explicar a última decisão tomada para uma missão
 * 
 * @param {string} mission - Nome da missão
 * @returns {Object} Explicação determinística
 * 
 * Exemplo:
 * {
 *   mission: "cleanup_system",
 *   last_decision: "blocked",
 *   reason: "ignored_3x",
 *   cooldown_until: "2026-01-21T22:00:00Z",
 *   based_on: {
 *     recent_suggestions: 3,
 *     ignored_streak: 3,
 *     acceptance_rate: 0.5,
 *     policy_version: "1.0"
 *   },
 *   explanation: "Sistema detectou 3 ignoradas consecutivas. Bloqueio por 6 horas conforme política.",
 *   next_action: "Próxima sugestão permitida em 2026-01-21T22:00:00Z"
 * }
 */
function explainLastDecision(mission) {
  if (!mission || typeof mission !== 'string') {
    return { error: 'invalid_mission_param', mission: null };
  }

  // Carregar histórico
  let history = { suggestions: [] };
  try {
    if (fs.existsSync(HISTORY_PATH)) {
      const rawData = fs.readFileSync(HISTORY_PATH, 'utf8');
      if (rawData && rawData.trim()) {
        history = JSON.parse(rawData);
      }
    }
  } catch (err) {
    logInfo({
      event_type: 'explainer_history_read_fail',
      message: err.message,
      mission
    });
  }

  const missionSuggestions = Array.isArray(history.suggestions)
    ? history.suggestions.filter(s => s.mission === mission)
    : [];

  if (missionSuggestions.length === 0) {
    return {
      mission,
      last_decision: 'allowed',
      reason: 'no_history',
      based_on: {
        recent_suggestions: 0,
        ignored_streak: 0,
        acceptance_rate: null,
        policy_version: '1.0'
      },
      explanation: 'Missão nova, sem histórico anterior. Primeira sugestão sempre permitida.',
      next_action: 'Sugestão será avaliada normalmente'
    };
  }

  // Ordenar por timestamp
  const sorted = missionSuggestions.sort(
    (a, b) => new Date(a.sent_at || 0) - new Date(b.sent_at || 0)
  );

  // Últimas 10 sugestões (janela de avaliação)
  const recent = sorted.slice(-10);

  // Calcular métricas
  const ignored = recent.filter(s => s.reaction === 'ignored').length;
  const accepted = recent.filter(s => s.reaction === 'accepted').length;
  const acceptRate = recent.length > 0 ? accepted / recent.length : 0;

  // Sequência de ignoradas consecutivas
  let ignoreStreak = 0;
  for (let i = recent.length - 1; i >= 0; i--) {
    if (recent[i].reaction === 'ignored') {
      ignoreStreak++;
    } else {
      break;
    }
  }

  // Reconstruir a última decisão baseada em regras de política
  let lastDecision = 'allowed';
  let decisionReason = 'ok';
  let cooldownHours = 0;
  let explanation = '';

  if (ignoreStreak >= 5) {
    lastDecision = 'blocked';
    decisionReason = 'ignored_5x';
    cooldownHours = 24;
    explanation = `Detectadas ${ignoreStreak} ignoradas consecutivas. Política: bloqueio por 24 horas.`;
  } else if (ignoreStreak >= 3) {
    lastDecision = 'blocked';
    decisionReason = 'ignored_3x';
    cooldownHours = 6;
    explanation = `Detectadas ${ignoreStreak} ignoradas consecutivas. Política: bloqueio por 6 horas.`;
  } else if (acceptRate < 0.3) {
    lastDecision = 'blocked';
    decisionReason = 'low_acceptance_rate';
    cooldownHours = 12;
    explanation = `Taxa de aceitação (${(acceptRate * 100).toFixed(1)}%) abaixo de 30%. Política: bloqueio por 12 horas.`;
  } else {
    explanation = `Métricas saudáveis: ${accepted} aceitas em ${recent.length} sugestões (${(acceptRate * 100).toFixed(1)}%). Sugestão permitida.`;
  }

  // Calcular cooldown
  let cooldownUntil = null;
  if (cooldownHours > 0) {
    const now = new Date();
    cooldownUntil = new Date(now.getTime() + cooldownHours * 60 * 60 * 1000).toISOString();
  }

  return {
    mission,
    last_decision: lastDecision,
    reason: decisionReason,
    cooldown_until: cooldownUntil,
    based_on: {
      recent_suggestions: recent.length,
      ignored_streak: ignoreStreak,
      acceptance_rate: acceptRate,
      accepted: accepted,
      ignored: ignored,
      policy_version: '1.0'
    },
    explanation,
    next_action: cooldownUntil
      ? `Próxima sugestão permitida em ${cooldownUntil}`
      : 'Sugestão pode ser feita agora'
  };
}

/**
 * Explicar decisões para todas as missões
 * 
 * @returns {Array<Object>} Array de explicações
 */
function explainAllDecisions() {
  let history = { suggestions: [] };
  try {
    if (fs.existsSync(HISTORY_PATH)) {
      const rawData = fs.readFileSync(HISTORY_PATH, 'utf8');
      if (rawData && rawData.trim()) {
        history = JSON.parse(rawData);
      }
    }
  } catch (err) {
    logInfo({
      event_type: 'explainer_history_read_fail',
      message: err.message
    });
  }

  const suggestions = Array.isArray(history.suggestions) ? history.suggestions : [];
  const missions = new Set(suggestions.map(s => s.mission).filter(m => m));

  return Array.from(missions)
    .map(mission => explainLastDecision(mission))
    .sort((a, b) => {
      // Colocar bloqueadas primeiro
      if (a.last_decision !== b.last_decision) {
        return a.last_decision === 'blocked' ? -1 : 1;
      }
      return a.mission.localeCompare(b.mission);
    });
}

module.exports = {
  explainLastDecision,
  explainAllDecisions
};
