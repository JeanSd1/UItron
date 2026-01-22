const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/suggestion_history.json');
const REACTION_WINDOW_MINUTES = 120;

function loadData() {
  if (!fs.existsSync(DATA_PATH)) {
    return { suggestions: [] };
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function nowISO() {
  return new Date().toISOString();
}

function minutesBetween(a, b) {
  return Math.abs(new Date(a) - new Date(b)) / 60000;
}

/**
 * Registrar uma sugestão enviada ao usuário
 */
function registerSuggestion(suggestion) {
  const data = loadData();

  data.suggestions.push({
    id: suggestion.id,
    mission: suggestion.mission,
    confidence: suggestion.confidence,
    sent_at: nowISO(),
    reacted: false,
    reaction: null,
    reaction_time_minutes: null
  });

  saveData(data);
}

/**
 * Registrar execução de missão
 * Se coincidir com sugestão recente → marca reação positiva
 */
function registerMissionExecution(missionName) {
  const data = loadData();
  const now = nowISO();

  for (const s of data.suggestions) {
    if (
      s.mission === missionName &&
      !s.reacted &&
      minutesBetween(s.sent_at, now) <= REACTION_WINDOW_MINUTES
    ) {
      s.reacted = true;
      s.reaction = 'accepted';
      s.reaction_time_minutes = Math.round(
        minutesBetween(s.sent_at, now)
      );
    }
  }

  saveData(data);
}

/**
 * Métricas simples para inspeção futura
 */
function analyzeReactions() {
  const data = loadData();
  const result = {};

  for (const s of data.suggestions) {
    if (!result[s.mission]) {
      result[s.mission] = {
        sent: 0,
        reacted: 0,
        avg_latency_minutes: null
      };
    }

    result[s.mission].sent += 1;
    if (s.reacted) {
      result[s.mission].reacted += 1;
    }
  }

  for (const mission in result) {
    const reactedItems = data.suggestions.filter(
      s => s.mission === mission && s.reacted
    );

    if (reactedItems.length > 0) {
      const avg =
        reactedItems.reduce(
          (sum, s) => sum + s.reaction_time_minutes,
          0
        ) / reactedItems.length;

      result[mission].avg_latency_minutes = Math.round(avg);
    }
  }

  return result;
}

module.exports = {
  registerSuggestion,
  registerMissionExecution,
  analyzeReactions
};
