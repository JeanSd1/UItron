const fs = require("fs");
const path = require("path");

const PROFILE_PATH = path.join(__dirname, "..", "data", "profile.json");

/**
 * Carrega o perfil de usuário aprendido
 * Se não existir, retorna um perfil vazio
 */
function loadProfile() {
  if (!fs.existsSync(PROFILE_PATH)) {
    return {
      version: 1,
      missions: {},
      time_preferences: {},
      cooldown_multiplier: 1.0,
      updated_at: new Date().toISOString()
    };
  }

  try {
    return JSON.parse(fs.readFileSync(PROFILE_PATH, "utf-8"));
  } catch (err) {
    console.error("Erro ao carregar profile.json:", err.message);
    return {
      version: 1,
      missions: {},
      time_preferences: {},
      cooldown_multiplier: 1.0,
      updated_at: new Date().toISOString()
    };
  }
}

/**
 * Salva o perfil de usuário aprendido
 * Sempre versionado e com timestamp
 */
function saveProfile(profile) {
  try {
    // Garantir que temos os campos obrigatórios
    if (!profile.version) profile.version = 1;
    if (!profile.missions) profile.missions = {};
    if (!profile.time_preferences) profile.time_preferences = {};
    if (!profile.cooldown_multiplier) profile.cooldown_multiplier = 1.0;

    profile.updated_at = new Date().toISOString();

    fs.writeFileSync(PROFILE_PATH, JSON.stringify(profile, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Erro ao salvar profile.json:", err.message);
    return false;
  }
}

/**
 * Retorna informações sobre o perfil aprendido
 */
function getProfileStats() {
  const profile = loadProfile();

  return {
    missions_tracked: Object.keys(profile.missions).length,
    total_data_points: Object.values(profile.missions).reduce(
      (sum, m) => sum + m.authorized + m.denied,
      0
    ),
    cooldown_multiplier: profile.cooldown_multiplier,
    last_updated: profile.updated_at
  };
}

/**
 * Retorna confiança (0.0 a 1.0) de uma missão ser autorizada
 * @param {string} mission - Nome da missão
 * @returns {number|null} Confiança ou null se sem dados
 */
function getMissionConfidence(mission) {
  const profile = loadProfile();
  return profile.missions?.[mission]?.confidence ?? null;
}

module.exports = {
  loadProfile,
  saveProfile,
  getProfileStats,
  getMissionConfidence
};
