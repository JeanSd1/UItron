#!/usr/bin/env node
/**
 * Test script para validar o scheduler com logs diretos
 */

const path = require("path");
const fs = require("fs");

// Garantir que a pasta logs existe
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

console.log("🚀 Iniciando teste direto do scheduler...\n");

// Mock do cron para testar
const cron = require("node-cron");
const logger = require("./config/logger");

// Teste 1: Verificar se o logger está funcionando
console.log("✅ Logger carregado");
logger.info("📝 Teste 1: Logger funcionando corretamente");

// Teste 2: Agendar uma tarefa a cada 10 segundos (padrão cron diferente)
console.log("⏱️ Agendando tarefa a cada 10 segundos...\n");

let count = 0;
// Formato: segundo minuto hora dia-mês dia-semana
// */10 * * * * * = a cada 10 segundos
const task = cron.schedule("*/10 * * * * *", () => {
  count++;
  const msg = `🧪 Execução #${count} - ${new Date().toISOString()}`;
  console.log(msg);
  logger.info("TESTE_CRON", { execution: count, timestamp: new Date().toISOString() });
  
  if (count >= 3) {
    console.log("\n✅ Teste concluído! 3 execuções realizadas.");
    task.stop();
    process.exit(0);
  }
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});

console.log("⏳ Aguardando execuções (timeout em 40 segundos)...\n");

// Timeout de segurança
setTimeout(() => {
  console.log("\n⏱️ Timeout atingido");
  task.stop();
  process.exit(1);
}, 40000);
