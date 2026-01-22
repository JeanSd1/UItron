/**
 * Analisa dados de saúde e decide se o sistema precisa de atenção humana
 * NÃO executa ações
 */
function evaluateHealth(healthStats) {
  if (!healthStats.available) {
    return {
      decision: "UNKNOWN",
      reason: healthStats.reason,
      requires_human: false,
      recommendations: []
    };
  }

  const recommendations = [];
  let decision = "OK";
  let requiresHuman = false;

  // Regras de decisão
  if (healthStats.failures > 0) {
    decision = "WARN";
    requiresHuman = true;
    recommendations.push({
      type: "investigate",
      message: "Falhas detectadas nas execuções recentes de check_health."
    });
  }

  if (healthStats.lastDiskFree !== null && healthStats.lastDiskFree < 20) {
    decision = "CRITICAL";
    requiresHuman = true;
    recommendations.push({
      type: "cleanup_suggested",
      message: `Espaço em disco crítico (${healthStats.lastDiskFree}% livre). Sugere executar cleanup_system.`,
      suggested_mission: "cleanup_system"
    });
  }

  if (decision === "OK") {
    recommendations.push({
      type: "status",
      message: "Sistema saudável. Nenhuma ação necessária."
    });
  }

  return {
    decision,
    analyzed: healthStats.analyzed,
    requires_human: requiresHuman,
    timestamp: new Date().toISOString(),
    recommendations
  };
}

module.exports = {
  evaluateHealth
};
