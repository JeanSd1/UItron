const fs = require("fs");
const path = require("path");

const HISTORY_PATH = path.join(__dirname, "..", "missions", "history.json");

/**
 * Lê o histórico e retorna as últimas execuções de check_health
 * @param {number} limit Quantidade de execuções analisadas
 */
function getRecentHealthStats(limit = 3) {
  if (!fs.existsSync(HISTORY_PATH)) {
    return {
      available: false,
      reason: "history_not_found",
      records: []
    };
  }

  const raw = fs.readFileSync(HISTORY_PATH, "utf-8");
  let history;

  try {
    history = JSON.parse(raw);
  } catch (err) {
    return {
      available: false,
      reason: "history_corrupted",
      records: []
    };
  }

  const healthRuns = history
    .filter(entry => entry.mission === "check_health")
    .slice(-limit);

  if (healthRuns.length === 0) {
    return {
      available: false,
      reason: "no_health_data",
      records: []
    };
  }

  let failures = 0;
  let lastDiskFree = null;

  healthRuns.forEach(run => {
    if (run.status !== "success") failures++;

    if (run.result?.disk?.freePercent !== undefined) {
      lastDiskFree = run.result.disk.freePercent;
    }
  });

  return {
    available: true,
    analyzed: healthRuns.length,
    failures,
    lastDiskFree,
    timestamp: new Date().toISOString(),
    records: healthRuns.map(r => ({
      id: r.id,
      status: r.status,
      diskFree: r.result?.disk?.freePercent ?? null,
      at: r.timestamp
    }))
  };
}

module.exports = {
  getRecentHealthStats
};
