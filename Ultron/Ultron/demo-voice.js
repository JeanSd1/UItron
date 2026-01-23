#!/usr/bin/env node

/**
 * DEMO - Ultron Voice System
 * 
 * Demonstração visual de como interagir com Ultron por voz
 */

const fs = require('fs');
const path = require('path');
const voiceAdapter = require('./app/voice/voice_adapter_simple');
const voiceLogger = require('./app/voice/voice_logger_simple');
const voiceResponder = require('./app/voice/voice_responder_simple');
const intentRouter = require('./app/voice/intent_router_simple');

// Cores
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  dim: '\x1b[2m'
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  console.clear();
  
  console.log(`
${colors.bright}${colors.magenta}╔════════════════════════════════════════════════════════════╗${colors.reset}
${colors.bright}${colors.magenta}║                                                            ║${colors.reset}
${colors.bright}${colors.magenta}║     🎙️  DEMONSTRAÇÃO ULTRON - INTERFACE DE VOZ             ║${colors.reset}
${colors.bright}${colors.magenta}║                                                            ║${colors.reset}
${colors.bright}${colors.magenta}║  Como falar com Ultron e receber respostas por voz        ║${colors.reset}
${colors.bright}${colors.magenta}║                                                            ║${colors.reset}
${colors.bright}${colors.magenta}╚════════════════════════════════════════════════════════════╝${colors.reset}
  `);
  
  await delay(2000);
  
  // Cenário 1: Verificar Status
  console.log(`${colors.bright}${colors.cyan}CENÁRIO 1: Verificar Status do Sistema${colors.reset}\n`);
  
  console.log(`${colors.yellow}👤 Você:${colors.reset} "qual é o status?"\n`);
  await delay(1000);
  
  const statusResult = await processCommand('qual é o status');
  console.log(`${colors.green}🤖 Ultron:${colors.reset} "${statusResult.response}"\n`);
  await delay(1500);
  
  console.log(`${colors.dim}────────────────────────────────────────────────────────────${colors.reset}\n`);
  await delay(1000);
  
  // Cenário 2: Métricas
  console.log(`${colors.bright}${colors.cyan}CENÁRIO 2: Visualizar Métricas${colors.reset}\n`);
  
  console.log(`${colors.yellow}👤 Você:${colors.reset} "mostrar métricas"\n`);
  await delay(1000);
  
  const metricsResult = await processCommand('mostrar métricas');
  console.log(`${colors.green}🤖 Ultron:${colors.reset} "${metricsResult.response}"\n`);
  await delay(1500);
  
  console.log(`${colors.dim}────────────────────────────────────────────────────────────${colors.reset}\n`);
  await delay(1000);
  
  // Cenário 3: Histórico
  console.log(`${colors.bright}${colors.cyan}CENÁRIO 3: Consultar Histórico${colors.reset}\n`);
  
  console.log(`${colors.yellow}👤 Você:${colors.reset} "histórico completo"\n`);
  await delay(1000);
  
  const historyResult = await processCommand('histórico completo');
  console.log(`${colors.green}🤖 Ultron:${colors.reset} "${historyResult.response}"\n`);
  await delay(1500);
  
  console.log(`${colors.dim}────────────────────────────────────────────────────────────${colors.reset}\n`);
  await delay(1000);
  
  // Cenário 4: Segurança - Bloqueio
  console.log(`${colors.bright}${colors.cyan}CENÁRIO 4: Teste de Segurança (Bloqueio)${colors.reset}\n`);
  
  console.log(`${colors.yellow}👤 Você:${colors.reset} "executar script malicioso"\n`);
  await delay(1000);
  
  const blockedRoute = intentRouter.routeIntent('executar script');
  console.log(`${colors.red}🚫 [BLOQUEADO]${colors.reset} ${blockedRoute.reason}\n`);
  console.log(`${colors.green}🤖 Ultron:${colors.reset} "Este comando não é permitido por questões de segurança."\n`);
  await delay(1500);
  
  console.log(`${colors.dim}────────────────────────────────────────────────────────────${colors.reset}\n`);
  await delay(1000);
  
  // Cenário 5: Ajuda
  console.log(`${colors.bright}${colors.cyan}CENÁRIO 5: Pedir Ajuda${colors.reset}\n`);
  
  console.log(`${colors.yellow}👤 Você:${colors.reset} "como você funciona?"\n`);
  await delay(1000);
  
  const helpResult = await processCommand('como você funciona');
  console.log(`${colors.green}🤖 Ultron:${colors.reset} "${helpResult.response}"\n`);
  await delay(1500);
  
  console.log(`${colors.dim}────────────────────────────────────────────────────────────${colors.reset}\n`);
  
  // Resumo
  await delay(1000);
  
  const stats = voiceAdapter.getStats();
  
  console.log(`${colors.bright}${colors.cyan}📊 RESUMO DA DEMONSTRAÇÃO${colors.reset}\n`);
  console.log(`Total de Eventos:        ${stats.total_events}`);
  console.log(`${colors.green}✓ Sucessos:${colors.reset}              ${stats.success}`);
  console.log(`${colors.red}🚫 Bloqueados:${colors.reset}             ${stats.blocked}`);
  console.log(`${colors.yellow}! Erros:${colors.reset}                 ${stats.errors}`);
  console.log(`Taxa de Sucesso:         ${stats.total_events > 0 ? ((stats.success / stats.total_events) * 100).toFixed(1) : 0}%\n`);
  
  // Características
  console.log(`${colors.bright}${colors.cyan}✨ CARACTERÍSTICAS${colors.reset}\n`);
  console.log(`${colors.green}✓${colors.reset} Responde por voz (TTS - Text-to-Speech)`);
  console.log(`${colors.green}✓${colors.reset} Segurança automática (bloqueia comandos perigosos)`);
  console.log(`${colors.green}✓${colors.reset} Auditoria completa (todos os eventos registrados)`);
  console.log(`${colors.green}✓${colors.reset} Read-only (apenas consultas, sem modificações)`);
  console.log(`${colors.green}✓${colors.reset} Offline-first (funciona sem internet)`);
  console.log(`${colors.green}✓${colors.reset} Determinístico (mesma entrada = mesma resposta)\n`);
  
  // Como usar
  console.log(`${colors.bright}${colors.cyan}🚀 COMO COMEÇAR${colors.reset}\n`);
  console.log(`1. Abra um terminal`);
  console.log(`2. Execute: ${colors.bright}node ultron-live.js${colors.reset}`);
  console.log(`3. Digite seus comandos:`);
  console.log(`   ${colors.dim}ultron> qual é o status${colors.reset}`);
  console.log(`   ${colors.dim}ultron> mostrar métricas${colors.reset}`);
  console.log(`   ${colors.dim}ultron> histórico completo${colors.reset}`);
  console.log(`4. Ultron responderá por voz 🔊\n`);
  
  // Intents disponíveis
  console.log(`${colors.bright}${colors.cyan}📋 INTENTS DISPONÍVEIS${colors.reset}\n`);
  console.log(`${colors.green}status${colors.reset}    → Verificar status do sistema`);
  console.log(`${colors.green}metrics${colors.reset}   → Visualizar métricas de performance`);
  console.log(`${colors.green}decisions${colors.reset} → Ver últimas decisões tomadas`);
  console.log(`${colors.green}history${colors.reset}   → Consultar histórico de eventos`);
  console.log(`${colors.green}explain${colors.reset}   → Entender funcionamento`);
  console.log(`${colors.green}help${colors.reset}      → Obter ajuda\n`);
  
  // Documentação
  console.log(`${colors.bright}${colors.cyan}📖 DOCUMENTAÇÃO${colors.reset}\n`);
  console.log(`Ver arquivo: ${colors.bright}COMO_FALAR_COM_ULTRON.md${colors.reset}\n`);
  
  console.log(`${colors.dim}────────────────────────────────────────────────────────────${colors.reset}\n`);
  
  console.log(`${colors.bright}${colors.green}✅ Demonstração concluída com sucesso!${colors.reset}\n`);
  console.log(`${colors.bright}Ultron está pronto para receber seus comandos por voz.${colors.reset}\n`);
}

async function processCommand(input) {
  const startTime = Date.now();
  const sessionId = voiceLogger.generateSessionId();
  
  const route = intentRouter.routeIntent(input.toLowerCase());
  
  if (!route.success || !route.allowed) {
    return {
      success: false,
      response: 'Comando bloqueado por questões de segurança.'
    };
  }
  
  const response = voiceResponder.generateResponse(route.intent);
  
  voiceLogger.auditLog({
    event_type: 'voice_command_demo',
    input_text: input,
    intent: route.intent,
    response_text: response.response_text,
    status: 'success',
    session_id: sessionId,
    processing_time_ms: Date.now() - startTime
  });
  
  return {
    success: true,
    intent: route.intent,
    response: response.response_text
  };
}

// Executar demo
demo().catch(console.error);
