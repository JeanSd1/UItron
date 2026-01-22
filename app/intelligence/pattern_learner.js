const { loadProfile, saveProfile } = require("./user_profile");
const fs = require("fs");
const path = require("path");
const logger = require("../config/logger");

const HISTORY_PATH = path.join(__dirname, "..", "missions", "history.json");
const MIN_SAMPLES = 3; // Mínimo de amostras para aprender

/**
 * Aprende padrões de decisão a partir do histórico
 * Nunca executa ações, apenas observa e registra
 */
function learnFromHistory() {
  try {
    // Validação
    if (!fs.existsSync(HISTORY_PATH)) {
      logger.info("📚 Pattern Learner: histórico não encontrado");
      return false;
    }

    const rawHistory = fs.readFileSync(HISTORY_PATH, "utf-8");
    let history;

    try {
      history = JSON.parse(rawHistory);
    } catch (err) {
      logger.error("📚 Pattern Learner: histórico corrompido", err.message);
      return false;
    }

    if (!Array.isArray(history)) {
      logger.warn("📚 Pattern Learner: histórico não é um array");
      return false;
    }

    // Agrupar por missão
    const byMission = {};

    for (const entry of history) {
      // Procurar por campo que indica autorização (pode variar)
      const mission = entry.mission;
      const authorized =
        entry.authorized ||
        entry.status === "executed" ||
        entry.status === "success";

      if (!mission) continue;

      if (!byMission[mission]) {
        byMission[mission] = { yes: 0, no: 0 };
      }

      if (authorized) {
        byMission[mission].yes++;
      } else {
        byMission[mission].no++;
      }
    }

    // Carregar perfil existente
    const profile = loadProfile();
    let updated = false;

    // Atualizar missões aprendidas
    for (const mission in byMission) {
      const { yes, no } = byMission[mission];
      const total = yes + no;

      // Apenas aprender se temos mínimo de amostras
      if (total >= MIN_SAMPLES) {
        const confidence = +(yes / total).toFixed(2);

        // Registrar aprendizado
        profile.missions[mission] = {
          authorized: yes,
          denied: no,
          confidence,
          total_samples: total
        };

        updated = true;
      }
    }

    // Salvar se houve mudanças
    if (updated) {
      saveProfile(profile);
      logger.info("📚 Pattern Learner: perfil atualizado", {
        missions_learned: Object.keys(profile.missions).length,
        total_data_points: Object.values(profile.missions).reduce(
          (sum, m) => sum + m.authorized + m.denied,
          0
        )
      });
      return true;
    } else {
      logger.info("📚 Pattern Learner: sem novas amostras suficientes");
      return false;
    }

  } catch (err) {
    logger.error("❌ Pattern Learner: erro crítico", err.message);
    return false;
  }
}

/**
 * Retorna estatísticas de aprendizado
 */
function getStats() {
  try {
    const { loadProfile } = require("./user_profile");
    const profile = loadProfile();
    return {
      missionLearned: Object.keys(profile.missions).length,
      totalMissions: profile.missions,
      updated_at: profile.updated_at
    };
  } catch (err) {
    logger.error("❌ Pattern Learner: erro ao obter estatísticas", err.message);
    return null;
  }
}

module.exports = {
  learnFromHistory,
  getStats
};
