/**
 * Notifier Index
 * Agregador de canais de notificação
 */

const { notifyDesktop, getStatus: getDesktopStatus } = require("./desktop");
const logger = require("../config/logger");

/**
 * Dispara notificação via todos os canais ativos
 * @param {Object} decision - Decisão do Decision Engine
 */
function notify(decision) {
  try {
    if (!decision) {
      logger.warn("🔕 Notifier: sem decisão para notificar");
      return;
    }

    // Canal Desktop
    if (decision.requires_human) {
      notifyDesktop(decision);
    }

    // Log estruturado (sempre)
    logger.info("📢 Notification dispatched", {
      decision: decision.decision,
      requires_human: decision.requires_human,
      channels: ["desktop", "log"]
    });

  } catch (err) {
    logger.error("❌ Notifier: erro ao disparar", err.message);
  }
}

/**
 * Retorna status de todos os notificadores
 */
function getStatus() {
  return {
    desktop: getDesktopStatus(),
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  notify,
  getStatus
};
