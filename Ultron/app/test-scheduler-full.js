#!/usr/bin/env node
/**
 * Test script para validar scheduler + health_analyzer + decision_engine
 * Executa a cada 1 minuto para teste rápido
 */

const path = require("path");
const fs = require("fs");
const cron = require("node-cron");
const orchestrator = require("./orchestrator");
const logger = require("./config/logger");
const { getRecentHealthStats } = require("./intelligence/health_analyzer");
const { evaluateHealth } = require("./intelligence/decision_engine");
const { notify } = require("./notifier");
const { canNotifyNow } = require("./intelligence/notification_policy");

// Garantir que a pasta logs existe
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

console.log("🚀 Iniciando teste do Scheduler com Notifier...\n");

function testScheduler() {
  logger.info("🕒 Scheduler de teste iniciado");

  // TESTE: a cada 1 minuto
  const task = cron.schedule("*/1 * * * *", async () => {
    logger.info("🔍 Execução automática: check_health");

    try {
      // 1️⃣ Executa missão segura
      await orchestrator.executeMission(
        `health-${Date.now()}`,
        "check_health",
        {}
      );

      // 2️⃣ Analisa histórico recente
      const stats = getRecentHealthStats(3);
      console.log("\n📊 Health Stats:", JSON.stringify(stats, null, 2));

      // 3️⃣ Decide o que fazer
      const decision = evaluateHealth(stats);
      console.log("\n🧠 Decision:", JSON.stringify(decision, null, 2));

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

      // 6️⃣ Alerta humano se necessário
      if (decision.requires_human) {
        console.log("\n⚠️  ATENÇÃO: Ação humana necessária!");
        logger.warn("⚠️ Atenção humana necessária", decision.recommendations);
      } else {
        console.log("\n✅ Sistema OK");
      }

    } catch (err) {
      console.log("\n❌ Erro:", err.message);
      logger.error("❌ Erro no scheduler", err.message);
    }
  });

  console.log("✅ Scheduler de teste rodando (a cada 1 minuto)");
  console.log("📁 Logs em: app/logs/ultron.log");
  console.log("🔔 Notificações: Desktop (Windows Toast)");
  console.log("\n⏳ Aguardando primeira execução (máx 60 segundos)...\n");

  // Timeout de 2 minutos para teste
  setTimeout(() => {
    console.log("\n🛑 Teste finalizado");
    task.stop();
    process.exit(0);
  }, 120000);
}

testScheduler();

process.on("SIGINT", () => {
  console.log("\n🛑 Scheduler interrompido");
  process.exit(0);
});
