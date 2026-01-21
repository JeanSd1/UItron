const cron = require("node-cron");
const orchestrator = require("./orchestrator");
const logger = require("./config/logger");

const { getRecentHealthStats } = require("./intelligence/health_analyzer");
const { evaluateHealth } = require("./intelligence/decision_engine");
const { notify } = require("./notifier");
const { learnFromHistory } = require("./intelligence/pattern_learner");
const { canNotifyNow } = require("./intelligence/notification_policy");
const { generateSuggestions } = require("./intelligence/suggestion_engine");
const { registerSuggestion, registerMissionExecution } = require("./intelligence/reaction_learner");
const { canSuggest } = require("./intelligence/suggestion_policy");

function startScheduler() {
  logger.info("🕒 Scheduler iniciado (modo observação)");

  // Todos os dias às 09:00
  cron.schedule("0 9 * * *", async () => {
    logger.info("🔍 Execução automática: check_health");

    try {
      // 1️⃣ Executa missão segura
      await orchestrator.executeMission(
        `health-${Date.now()}`,
        "check_health",
        {}
      );

      // Registra execução para aprendizado de reação
      registerMissionExecution("check_health");

      // 2️⃣ Analisa histórico recente
      const stats = getRecentHealthStats(3);

      // 3️⃣ Decide o que fazer
      const decision = evaluateHealth(stats);

      // 4️⃣ Log estruturado
      logger.info("🧠 Decision Engine", decision);

      // 5️⃣ Notifica se autorizado pela política de horário
      const notificationCheck = canNotifyNow();

      if (!notificationCheck.allowed) {
        logger.info("🔕 Notificação suprimida por política de horário", {
          reason: notificationCheck.reason,
          decision: decision.decision
        });
      } else {
        notify(decision);
        logger.info("🔔 Notificação autorizada e enviada", {
          decision: decision.decision
        });
      }

      // 6️⃣ Aprende padrões (sem executar nada)
      learnFromHistory();

      // 7️⃣ Sugestões Proativas
      const suggestions = generateSuggestions();

      if (suggestions.length > 0) {
        const suggestionsNotificationCheck = canNotifyNow();

        if (!suggestionsNotificationCheck.allowed) {
          logger.info("🔕 Sugestões suprimidas por política de horário", {
            reason: suggestionsNotificationCheck.reason,
            count: suggestions.length
          });
        } else {
          suggestions.forEach(suggestion => {
            // Verificar política dinâmica de sugestões
            const policyCheck = canSuggest(suggestion.mission);

            if (!policyCheck.allowed) {
              logger.info("💡 Sugestão suprimida por policy", {
                mission: suggestion.mission,
                reason: policyCheck.reason,
                next_allowed_at: policyCheck.next_allowed_at,
                confidence: suggestion.confidence
              });
              return; // continue para próxima sugestão
            }

            // Sugestão autorizada: enviar notificação
            notify({
              type: 'SUGGESTION',
              title: '💡 Sugestão do Ultron',
              message: suggestion.reason,
              meta: suggestion
            });

            logger.info("💡 Sugestão enviada ao usuário", {
              mission: suggestion.mission,
              confidence: suggestion.confidence,
              severity: suggestion.severity,
              policy_status: "approved"
            });

            // Registra sugestão para aprendizado de reação
            registerSuggestion({
              id: `${suggestion.mission}-${Date.now()}`,
              mission: suggestion.mission,
              confidence: suggestion.confidence
            });
          });
        }
      }

      // 8️⃣ Alerta humano se necessário
      if (decision.requires_human) {
        logger.warn("⚠️ Atenção humana necessária", decision.recommendations);
      }

    } catch (err) {
      logger.error("❌ Erro no scheduler", err.message);
    }
  });
}

module.exports = {
  startScheduler
};
