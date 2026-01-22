#!/usr/bin/env node
/**
 * Test script para validar o scheduler funcionando
 * Simula o ambiente necessário para rodar o scheduler
 */

// Configurar paths necessários
const path = require("path");
const fs = require("fs");

// Garantir que a pasta logs existe
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Iniciar scheduler
console.log("🚀 Iniciando teste do scheduler...\n");

const { startScheduler } = require("./scheduler");
startScheduler();

console.log("✅ Scheduler iniciado com sucesso!");
console.log("🧪 Teste rodará a cada 1 minuto.");
console.log("📁 Logs em: app/logs/ultron.log");
console.log("📊 Histórico em: app/missions/history.json");
console.log("\n⏳ Aguardando execução (Ctrl+C para parar)...\n");

// Manter o processo vivo
process.on("SIGINT", () => {
  console.log("\n🛑 Scheduler interrompido");
  process.exit(0);
});
