const notifier = require("node-notifier");
const path = require("path");
const logger = require("../config/logger");

// Cache para evitar spam: timestamp do último alerta
let lastNotificationTime = 0;
const COOLDOWN_MS = 3600000; // 1 hora em ms

/**
 * Envia notificação nativa do Windows
 * Com cooldown de 1 hora para evitar spam
 */
function notifyDesktop(decision) {
  try {
    // Validação
    if (!decision || !decision.requires_human) {
      return false;
    }

    // Cooldown: não alerta se menos de 1h desde último
    const now = Date.now();
    if (now - lastNotificationTime < COOLDOWN_MS) {
      logger.info("🔕 Desktop notifier: cooldown ativo (1h)", {
        timeUntilNextAlert: Math.ceil((COOLDOWN_MS - (now - lastNotificationTime)) / 60000)
      });
      return false;
    }

    // Construir mensagem
    const title = "⚠️ UItron – Atenção necessária";
    const recommendations = decision.recommendations || [];
    const messageLines = recommendations
      .map(r => `• ${r.message}`)
      .join("\n");

    const message = messageLines || "Sistema requer revisão";

    // Enviar notificação
    notifier.notify(
      {
        title,
        message,
        icon: path.join(__dirname, "..", "assets", "icons", "warning.png"),
        sound: false,
        wait: false,
        timeout: 10 // 10 segundos
      },
      (err, response) => {
        if (err) {
          logger.error("❌ Desktop notifier: erro ao enviar", err.message);
          return;
        }

        logger.info("🔔 Desktop notifier: alerta enviado", {
          title,
          decision: decision.decision,
          recommendations: recommendations.length
        });
      }
    );

    // Atualizar timestamp
    lastNotificationTime = now;
    return true;

  } catch (err) {
    logger.error("❌ Desktop notifier: erro crítico", err.message);
    return false;
  }
}

/**
 * Retorna informações sobre o estado do notifier
 */
function getStatus() {
  const now = Date.now();
  const timeSinceLastAlert = now - lastNotificationTime;
  const cooldownActive = timeSinceLastAlert < COOLDOWN_MS;

  return {
    active: true,
    cooldownActive,
    lastAlertTimestamp: lastNotificationTime || null,
    secondsUntilNextAlert: cooldownActive
      ? Math.ceil((COOLDOWN_MS - timeSinceLastAlert) / 1000)
      : 0
  };
}

module.exports = {
  notifyDesktop,
  getStatus
};
