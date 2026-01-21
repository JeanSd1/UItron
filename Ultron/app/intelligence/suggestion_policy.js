const fs = require('fs');
const path = require('path');
const { logPolicyDecision, logHistoryReadFailure } = require('../config/auditLogger');

const HISTORY_PATH = path.join(__dirname, '../data/suggestion_history.json');

/**
 * Determina se é ético e útil sugerir uma ação agora
 * 
 * Baseado em:
 * - Taxa de aceitação histórica
 * - Sequência de ignoradas consecutivas
 * - Latência média de aceitas
 * 
 * EDGE CASES TRATADOS:
 * - Arquivo corrompido/inacessível → fail-open com log
 * - Missão nova/renomeada → primeira sugestão permitida
 * - Timestamps fora de ordem → normalização defensiva
 * 
 * Logs com schema único, correlação por suggestion_id, níveis consistentes
 * 
 * Retorna: { allowed: boolean, reason: string, next_allowed_at?: ISOString, audit: object }
 */
function canSuggest(mission, suggestion_id = null) {
  // Validação de entrada (edge case: mission vazio)
  if (!mission || typeof mission !== 'string') {
    return { 
      allowed: true, 
      reason: 'invalid_mission_param', 
      audit: { error: 'mission deve ser string não-vazia' } 
    };
  }

  // Sem histórico = primeira sugestão, sempre permitida
  if (!fs.existsSync(HISTORY_PATH)) {
    return { 
      allowed: true, 
      reason: 'no_history',
      audit: { file_status: 'not_found' }
    };
  }

  try {
    const rawData = fs.readFileSync(HISTORY_PATH, 'utf8');
    // Edge case: arquivo vazio
    if (!rawData || rawData.trim() === '') {
      return {
        allowed: true,
        reason: 'empty_history',
        audit: { file_status: 'empty' }
      };
    }
    const data = JSON.parse(rawData);
    let allSuggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
    // Normalização defensiva de timestamps
    const logger = require('../config/logger');
    allSuggestions = allSuggestions.filter(s => {
      if (!s.sent_at || isNaN(Date.parse(s.sent_at))) {
        logHistoryReadFailure({
          reason: 'Invalid or missing timestamp',
          suggestion_id: s.suggestion_id || null,
          mission: s.mission || null
        });
        return false;
      }
      if (new Date(s.sent_at) > new Date()) {
        logHistoryReadFailure({
          reason: 'Timestamp in the future',
          suggestion_id: s.suggestion_id || null,
          mission: s.mission || null
        });
        return false;
      }
      // Normaliza formato ISO
      s.sent_at = new Date(s.sent_at).toISOString();
      return true;
    });
    // Coletar histórico recente da missão (últimas 10)
    const suggestions = allSuggestions
      .filter(s => s.mission === mission && s.sent_at)
      .sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at))
      .slice(-10);

    // Sem sugestões anteriores desta missão
    if (suggestions.length === 0) {
      return { 
        allowed: true, 
        reason: 'no_prior_suggestions',
        audit: { mission_status: 'new' }
      };
    }

    // 2️⃣ Calcular métricas
    
    // Sequência de ignoradas consecutivas (começando do final)
    let ignoreStreak = 0;
    for (let i = suggestions.length - 1; i >= 0; i--) {
      if (suggestions[i].reaction === 'ignored') {
        ignoreStreak++;
      } else {
        break;
      }
    }

    // Taxa de aceitação
    const accepted = suggestions.filter(s => s.reaction === 'accepted').length;
    const acceptanceRate = suggestions.length > 0 ? accepted / suggestions.length : 0;

    // Latência média (apenas aceitas)
    const acceptedWithLatency = suggestions.filter(
      s => s.reaction === 'accepted' && s.reaction_time_minutes !== null
    );
    const avgLatency = acceptedWithLatency.length > 0
      ? acceptedWithLatency.reduce((sum, s) => sum + s.reaction_time_minutes, 0) / acceptedWithLatency.length
      : null;

    // 3️⃣ Aplicar política de cooldown
    const now = Date.now();

    const block = (hours, policyName) => {
      const nextAllowed = new Date(now + hours * 60 * 60 * 1000).toISOString();
      
      // Log com schema único, correlação por suggestion_id
      logPolicyDecision({
        suggestion_id: suggestion_id || `policy-${Date.now()}`,
        mission,
        policy_name: policyName,
        decision: 'blocked',
        metrics: {
          ignore_streak: ignoreStreak,
          acceptance_rate: acceptanceRate,
          sample_size: suggestions.length
        },
        next_allowed_at: nextAllowed
      });
      
      return {
        allowed: false,
        reason: policyName,
        next_allowed_at: nextAllowed,
        audit: {
          ignore_streak: ignoreStreak,
          acceptance_rate: acceptanceRate,
          sample_size: suggestions.length,
          blocked_duration_hours: hours
        }
      };
    };

    // Condições de bloqueio (em ordem de severidade)
    if (ignoreStreak >= 5) {
      return block(24, 'ignored_5x');
    }

    if (ignoreStreak >= 3) {
      return block(6, 'ignored_3x');
    }

    if (acceptanceRate < 0.3) {
      return block(12, 'low_acceptance_rate');
    }

    // Caso contrário: permitir
    logPolicyDecision({
      suggestion_id: suggestion_id || `policy-${Date.now()}`,
      mission,
      policy_name: 'POLICY_APPROVED',
      decision: 'allowed',
      metrics: {
        acceptance_rate: acceptanceRate,
        ignore_streak: ignoreStreak,
        avg_latency_minutes: avgLatency,
        sample_size: suggestions.length
      }
    });

    return {
      allowed: true,
      reason: 'ok',
      audit: {
        acceptance_rate: acceptanceRate,
        ignore_streak: ignoreStreak,
        avg_latency_minutes: avgLatency,
        sample_size: suggestions.length,
        decision: 'POLICY_APPROVED'
      }
    };

  } catch (err) {
    // Em caso de erro ao ler/parsear, permitir (fail-safe) e logar
    logHistoryReadFailure({
      reason: err.message,
      suggestion_id: suggestion_id || null,
      mission: mission || null
    });
    return { allowed: true, reason: 'parse_error_fail_safe', audit: { file_status: 'fail_open' } };
  }
}

module.exports = { canSuggest };
