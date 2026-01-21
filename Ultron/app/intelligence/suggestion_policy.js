const fs = require('fs');
const path = require('path');

const HISTORY_PATH = path.join(__dirname, '../data/suggestion_history.json');

/**
 * Determina se é ético e útil sugerir uma ação agora
 * 
 * Baseado em:
 * - Taxa de aceitação histórica
 * - Sequência de ignoradas consecutivas
 * - Latência média de aceitas
 * 
 * Retorna: { allowed: boolean, reason: string, next_allowed_at?: ISOString }
 */
function canSuggest(mission) {
  // Sem histórico = primeira sugestão, sempre permitida
  if (!fs.existsSync(HISTORY_PATH)) {
    return { allowed: true, reason: 'no_history' };
  }

  try {
    const data = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8'));
    const allSuggestions = data.suggestions || [];

    // Coletar histórico recente da missão (últimas 10)
    const suggestions = allSuggestions
      .filter(s => s.mission === mission)
      .slice(-10);

    // Sem sugestões anteriores desta missão
    if (suggestions.length === 0) {
      return { allowed: true, reason: 'no_prior_suggestions' };
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

    const block = (hours, reason) => ({
      allowed: false,
      reason,
      next_allowed_at: new Date(now + hours * 60 * 60 * 1000).toISOString()
    });

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
    return {
      allowed: true,
      reason: 'ok',
      metrics: {
        acceptance_rate: acceptanceRate,
        ignore_streak: ignoreStreak,
        avg_latency_minutes: avgLatency,
        recent_sample_size: suggestions.length
      }
    };

  } catch (err) {
    // Em caso de erro ao ler/parsear, permitir (fail-safe)
    return { allowed: true, reason: 'parse_error_fail_safe' };
  }
}

module.exports = { canSuggest };
