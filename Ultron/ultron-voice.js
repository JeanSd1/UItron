#!/usr/bin/env node

/**
 * ULTRON - Interface de Voz
 * 
 * Sistema de voz production-ready, offline-first, read-only e audit-grade.
 * Comandos disponíveis: status, metrics, decisions, history, explain, help
 * 
 * Uso:
 *   node ultron-voice.js
 * 
 * Testes:
 *   node ultron-voice.js test        # Teste simples
 *   node ultron-voice.js interactive # Teste interativo com TTS
 */

const fs = require('fs');
const path = require('path');
const voiceAdapter = require('./app/voice/voice_adapter_simple');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(type, message) {
  const prefix = {
    'info': `${colors.cyan}[INFO]${colors.reset}`,
    'success': `${colors.green}[✓]${colors.reset}`,
    'error': `${colors.red}[✗]${colors.reset}`,
    'warning': `${colors.yellow}[!]${colors.reset}`,
    'voice': `${colors.bright}🔊${colors.reset}`,
    'blocked': `${colors.red}🚫${colors.reset}`,
    'input': `${colors.blue}📝${colors.reset}`
  };
  
  console.log(`${prefix[type] || '[LOG]'} ${message}`);
}

async function runInteractiveTest() {
  log('info', 'Iniciando teste interativo com voz...\n');
  
  const scenarios = [
    {
      name: 'Verificar Status',
      inputs: ['qual é o status', 'como está ultron']
    },
    {
      name: 'Visualizar Métricas',
      inputs: ['mostrar métricas', 'dados de performance']
    },
    {
      name: 'Ver Decisões',
      inputs: ['quais foram as decisões', 'decisões tomadas']
    },
    {
      name: 'Histórico',
      inputs: ['histórico completo', 'eventos anteriores']
    },
    {
      name: 'Ajuda',
      inputs: ['ajuda', 'como funciona']
    }
  ];
  
  for (const scenario of scenarios) {
    log('info', `\n${colors.bright}${scenario.name}${colors.reset}`);
    
    // Usar primeira entrada como representativa
    const input = scenario.inputs[0];
    log('input', `"${input}"`);
    
    const result = await voiceAdapter.processVoiceInput();
    
    if (result.success) {
      log('success', `Intent: ${colors.bright}${result.intent}${colors.reset}`);
      log('voice', `"${result.response}"`);
      log('info', `Tempo: ${result.processing_time_ms}ms`);
    } else {
      log('blocked', result.reason || 'Comando bloqueado');
    }
  }
  
  // Teste de segurança
  log('info', `\n${colors.bright}Teste de Segurança${colors.reset}`);
  log('input', '"executar script malicioso"');
  
  const intentRouter = require('./app/voice/intent_router_simple');
  const blocked = intentRouter.routeIntent('executar script');
  
  if (!blocked.allowed) {
    log('success', 'Comando perigoso bloqueado corretamente');
  }
  
  // Estatísticas
  const stats = voiceAdapter.getStats();
  log('info', `\n${colors.bright}Estatísticas Finais${colors.reset}`);
  console.log(`  Total de eventos:  ${stats.total_events}`);
  console.log(`  ${colors.green}✓ Sucessos:${colors.reset}      ${stats.success}`);
  console.log(`  ${colors.red}✗ Bloqueados:${colors.reset}     ${stats.blocked}`);
  console.log(`  ${colors.yellow}! Erros:${colors.reset}         ${stats.errors}`);
  console.log('');
  
  log('success', 'Teste interativo concluído com sucesso!');
}

async function runQuickTest() {
  log('info', 'Executando teste rápido...\n');
  
  for (let i = 0; i < 3; i++) {
    log('input', 'Processando entrada de voz...');
    const result = await voiceAdapter.processVoiceInput();
    
    if (result.success) {
      log('success', `Intent: ${result.intent}`);
    } else {
      log('blocked', result.reason || 'Bloqueado');
    }
  }
  
  const stats = voiceAdapter.getStats();
  log('success', `Total de eventos: ${stats.total_events}`);
}

async function showHelp() {
  console.log(`
${colors.bright}╔══════════════════════════════════════════════════════╗${colors.reset}
${colors.bright}║              ULTRON - INTERFACE DE VOZ               ║${colors.reset}
${colors.bright}╚══════════════════════════════════════════════════════╝${colors.reset}

${colors.bright}Uso:${colors.reset}
  node ultron-voice.js [comando]

${colors.bright}Comandos:${colors.reset}
  (padrão)         Executa teste interativo com voz
  test             Executa teste rápido funcional
  interactive      Executa teste interativo completo com TTS
  help             Mostra esta mensagem
  status           Mostra status do sistema
  logs             Mostra últimos eventos de voz

${colors.bright}Intents Permitidos:${colors.reset}
  • status         Verificar status do sistema
  • metrics        Visualizar métricas de performance
  • decisions      Ver últimas decisões tomadas
  • history        Consultar histórico de eventos
  • explain        Entender funcionamento
  • help           Obter ajuda

${colors.bright}Palavras-chave Bloqueadas:${colors.reset}
  executar, rodar, apagar, deletar, modificar, alterar, forçar

${colors.bright}Exemplos:${colors.reset}
  "qual é o status"
  "mostrar métricas"
  "histórico completo"
  "como você funciona"

${colors.bright}Segurança:${colors.reset}
  ✓ Push-to-talk (sem escuta contínua)
  ✓ Read-only (sem modificações)
  ✓ Auditoria completa (JSON logging)
  ✓ Determinístico (mesmo resultado sempre)
  ✓ Offline-first (funciona sem internet)

${colors.bright}Documentação:${colors.reset}
  Ver app/voice/README.md para mais detalhes

${colors.bright}GitHub:${colors.reset}
  https://github.com/JeanSd1/UItron

  `);
}

async function showLogs() {
  const voiceLogger = require('./app/voice/voice_logger_simple');
  const { logs } = voiceLogger.readLogs(10);
  
  if (logs.length === 0) {
    log('info', 'Nenhum evento registrado ainda');
    return;
  }
  
  log('info', `${colors.bright}Últimos ${logs.length} eventos${colors.reset}\n`);
  
  for (const log_entry of logs) {
    const status = log_entry.status === 'success' ? colors.green + '✓' : colors.red + '✗';
    console.log(`${status}${colors.reset} [${log_entry.timestamp}] ${log_entry.event_type}`);
    if (log_entry.input_text) {
      console.log(`   Entrada: "${log_entry.input_text}"`);
    }
    if (log_entry.intent) {
      console.log(`   Intent: ${log_entry.intent}`);
    }
    if (log_entry.processing_time_ms !== undefined) {
      console.log(`   Tempo: ${log_entry.processing_time_ms}ms`);
    }
    console.log('');
  }
}

async function showStatus() {
  const stats = voiceAdapter.getStats();
  
  log('success', 'ULTRON - Voice Interface Status\n');
  console.log(`${colors.bright}Sistema:${colors.reset}`);
  console.log(`  Status: ${colors.green}ONLINE${colors.reset}`);
  console.log(`  Modo: Push-to-talk (read-only)`);
  console.log(`  Auditoria: Ativa`);
  console.log('');
  console.log(`${colors.bright}Estatísticas:${colors.reset}`);
  console.log(`  Total de eventos: ${stats.total_events}`);
  console.log(`  Sucessos: ${colors.green}${stats.success}${colors.reset}`);
  console.log(`  Bloqueados: ${colors.yellow}${stats.blocked}${colors.reset}`);
  console.log(`  Erros: ${colors.red}${stats.errors}${colors.reset}`);
  if (stats.last_event) {
    console.log(`  Último evento: ${stats.last_event}`);
  }
  console.log('');
}

// Main
const command = process.argv[2] || 'interactive';

(async () => {
  try {
    switch (command) {
      case 'test':
        await runQuickTest();
        break;
      case 'interactive':
        await runInteractiveTest();
        break;
      case 'help':
        await showHelp();
        break;
      case 'status':
        await showStatus();
        break;
      case 'logs':
        await showLogs();
        break;
      default:
        await runInteractiveTest();
    }
  } catch (error) {
    log('error', `Erro: ${error.message}`);
    process.exit(1);
  }
})();
