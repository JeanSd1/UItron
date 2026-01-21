#!/usr/bin/env node

/**
 * ULTRON - Voice Interaction (Conversational Mode)
 * 
 * Interface interativa onde você fala um comando e Ultron responde por voz.
 * 
 * Uso:
 *   node ultron-live.js
 * 
 * Exemplos de comandos por voz:
 *   "qual é o status"
 *   "mostrar métricas"
 *   "histórico completo"
 *   "como você funciona"
 *   "ajuda"
 */

const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const voiceAdapter = require('./app/voice/voice_adapter_simple');
const voiceLogger = require('./app/voice/voice_logger_simple');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// TTS melhorado
function speak(text, options = {}) {
  try {
    const rate = options.rate || 0;
    const volume = options.volume || 100;
    
    // Salvar em arquivo temporário
    const tempFile = path.join(__dirname, '.tts_temp.txt');
    fs.writeFileSync(tempFile, text, 'utf8');
    
    // PowerShell command para TTS
    const psCommand = `$text = [System.IO.File]::ReadAllText('${tempFile}', [System.Text.Encoding]::UTF8); Add-Type -AssemblyName System.Speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.Rate = ${rate}; $speak.Volume = ${volume}; $speak.Speak($text); Remove-Item '${tempFile}' -Force`;
    
    execSync(`powershell -NoProfile -Command "${psCommand}"`, { stdio: 'pipe' });
  } catch (error) {
    // Silenciosamente continuar se falhar
  }
}

// Função para reproduzir bip de "listening"
function beepListening() {
  try {
    const psCommand = `[console]::beep(1000, 100)`;
    execSync(`powershell -NoProfile -Command "${psCommand}"`, { stdio: 'pipe' });
  } catch (error) {
    // Ignorar erro
  }
}

// Função para reproduzir bip de "processed"
function beepProcessed() {
  try {
    const psCommand = `[console]::beep(800, 150); Start-Sleep -Milliseconds 100; [console]::beep(1000, 150)`;
    execSync(`powershell -NoProfile -Command "${psCommand}"`, { stdio: 'pipe' });
  } catch (error) {
    // Ignorar erro
  }
}

async function processVoiceCommand(userInput) {
  console.log(`${colors.cyan}[PROCESSANDO]${colors.reset} "${userInput}"\n`);
  
  // Simular captura real
  const startTime = Date.now();
  const sessionId = voiceLogger.generateSessionId();
  
  try {
    // Aqui é onde normalmente faria STT real
    // Por enquanto, usamos a entrada do usuário como transcrita
    const transcribedText = userInput.trim();
    
    if (!transcribedText) {
      console.log(`${colors.yellow}[VAZIO]${colors.reset} Nenhum comando detectado\n`);
      return;
    }
    
    // Roterizar intenção
    const intentRouter = require('./app/voice/intent_router_simple');
    const route = intentRouter.routeIntent(transcribedText.toLowerCase());
    
    if (!route.success || !route.allowed) {
      console.log(`${colors.red}[BLOQUEADO]${colors.reset} ${route.reason || 'Comando não permitido'}\n`);
      
      // Falar que foi bloqueado
      speak('Este comando não é permitido por questões de segurança.');
      
      // Registrar
      voiceLogger.auditLog({
        event_type: 'blocked',
        input_text: transcribedText,
        reason: route.reason,
        status: 'blocked',
        session_id: sessionId,
        processing_time_ms: Date.now() - startTime
      });
      
      return;
    }
    
    // Gerar resposta
    const voiceResponder = require('./app/voice/voice_responder_simple');
    const response = voiceResponder.generateResponse(route.intent);
    
    console.log(`${colors.green}[DETECTADO]${colors.reset} Intent: ${colors.bright}${route.intent}${colors.reset}`);
    console.log(`${colors.blue}[RESPOSTA]${colors.reset} "${response.response_text}"\n`);
    
    // Reproduzir bip de processamento
    beepProcessed();
    
    // Falar a resposta
    speak(response.response_text, { rate: 0, volume: 100 });
    
    // Registrar sucesso
    voiceLogger.auditLog({
      event_type: 'voice_command_processed',
      input_text: transcribedText,
      intent: route.intent,
      response_text: response.response_text,
      status: 'success',
      session_id: sessionId,
      processing_time_ms: Date.now() - startTime
    });
    
  } catch (error) {
    console.log(`${colors.red}[ERRO]${colors.reset} ${error.message}\n`);
    
    speak('Ocorreu um erro ao processar seu comando.');
    
    voiceLogger.auditLog({
      event_type: 'error',
      error: error.message,
      status: 'error',
      session_id: sessionId,
      processing_time_ms: Date.now() - startTime
    });
  }
}

function showWelcome() {
  console.clear();
  console.log(`
${colors.bright}${colors.magenta}╔═══════════════════════════════════════════════════════╗${colors.reset}
${colors.bright}${colors.magenta}║           ULTRON - INTERFACE DE VOZ INTERATIVA         ║${colors.reset}
${colors.bright}${colors.magenta}╚═══════════════════════════════════════════════════════╝${colors.reset}

${colors.bright}Sistema de Voz Ativo${colors.reset}
${colors.dim}─────────────────────────────────────────────────────────${colors.reset}

${colors.cyan}📝 Digite seu comando de voz:${colors.reset}

${colors.green}✓ Exemplos de comandos:${colors.reset}
  • "qual é o status"
  • "mostrar métricas"
  • "histórico completo"
  • "como você funciona"
  • "ajuda"
  • "quais foram as decisões"

${colors.yellow}⚠️  Palavras-chave bloqueadas:${colors.reset}
  executar, rodar, apagar, deletar, modificar, alterar, forçar

${colors.blue}💡 Dicas:${colors.reset}
  • Digite 'sair' ou 'exit' para encerrar
  • Digite 'status' para ver estatísticas
  • Digite 'help' para ajuda

${colors.dim}─────────────────────────────────────────────────────────${colors.reset}
  `);
}

function showHelp() {
  console.log(`
${colors.bright}AJUDA - COMANDOS DISPONÍVEIS${colors.reset}
${colors.dim}─────────────────────────────────────────────────────────${colors.reset}

${colors.green}Intents Permitidos:${colors.reset}
  status     → Verificar status do sistema
  metrics    → Visualizar métricas de performance
  decisions  → Ver últimas decisões tomadas
  history    → Consultar histórico de eventos
  explain    → Entender funcionamento
  help       → Obter ajuda

${colors.yellow}Comandos Especiais:${colors.reset}
  sair       → Encerrar aplicação
  exit       → Encerrar aplicação
  status     → Ver estatísticas de voz
  help       → Mostrar esta mensagem
  clear      → Limpar tela
  logs       → Ver últimos eventos
  demo       → Executar demonstração

${colors.cyan}Exemplos de Frases Naturais:${colors.reset}
  ✓ "qual é o status" → detecta: status
  ✓ "mostrar métricas" → detecta: metrics
  ✓ "histórico completo" → detecta: history
  ✓ "como você funciona" → detecta: explain
  ✓ "ajuda" → detecta: help

${colors.red}Frases Bloqueadas (por segurança):${colors.reset}
  ✗ "executar script" → BLOQUEADO (contém 'executar')
  ✗ "deletar arquivo" → BLOQUEADO (contém 'deletar')
  ✗ "modificar dados" → BLOQUEADO (contém 'modificar')

${colors.dim}─────────────────────────────────────────────────────────${colors.reset}
  `);
}

function showStats() {
  const stats = voiceAdapter.getStats();
  
  console.log(`
${colors.bright}ESTATÍSTICAS DE VOZ${colors.reset}
${colors.dim}─────────────────────────────────────────────────────────${colors.reset}

${colors.cyan}Total de Eventos:${colors.reset}  ${stats.total_events}
${colors.green}✓ Sucessos:${colors.reset}       ${stats.success}
${colors.yellow}⚠ Bloqueados:${colors.reset}      ${stats.blocked}
${colors.red}✗ Erros:${colors.reset}          ${stats.errors}

${colors.cyan}Taxa de Sucesso:${colors.reset}  ${stats.total_events > 0 ? ((stats.success / stats.total_events) * 100).toFixed(1) : 0}%
${colors.cyan}Último Evento:${colors.reset}    ${stats.last_event || 'Nenhum'}

${colors.dim}─────────────────────────────────────────────────────────${colors.reset}
  `);
}

function showLogs() {
  const { logs } = voiceLogger.readLogs(5);
  
  console.log(`
${colors.bright}ÚLTIMOS EVENTOS (5)${colors.reset}
${colors.dim}─────────────────────────────────────────────────────────${colors.reset}
  `);
  
  if (logs.length === 0) {
    console.log(`${colors.dim}Nenhum evento registrado ainda${colors.reset}\n`);
    return;
  }
  
  for (const log of logs) {
    const status = log.status === 'success' ? colors.green + '✓' : colors.red + '✗';
    console.log(`${status}${colors.reset} [${log.timestamp.split('T')[1].split('.')[0]}] ${log.event_type}`);
    if (log.input_text) {
      console.log(`   "${log.input_text}"`);
    }
  }
  
  console.log(`${colors.dim}─────────────────────────────────────────────────────────${colors.reset}\n`);
}

async function runDemo() {
  console.log(`\n${colors.bright}DEMONSTRAÇÃO AUTOMÁTICA${colors.reset}\n`);
  
  const demoCommands = [
    'qual é o status',
    'mostrar métricas',
    'histórico completo'
  ];
  
  for (const command of demoCommands) {
    console.log(`${colors.cyan}[DEMO]${colors.reset} Executando: "${command}"`);
    await processVoiceCommand(command);
    
    // Aguardar antes de próximo comando
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

async function main() {
  showWelcome();
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });
  
  const prompt = () => {
    rl.question(`${colors.cyan}ultron${colors.reset}> `, async (input) => {
      const command = input.trim().toLowerCase();
      
      if (!command) {
        prompt();
        return;
      }
      
      // Comandos especiais
      switch (command) {
        case 'sair':
        case 'exit':
          console.log(`\n${colors.yellow}[ENCERRAR]${colors.reset} Ultron desligando...\n`);
          speak('Até logo. Ultron desligando.');
          rl.close();
          process.exit(0);
          break;
          
        case 'help':
          showHelp();
          prompt();
          break;
          
        case 'status':
          showStats();
          prompt();
          break;
          
        case 'logs':
          showLogs();
          prompt();
          break;
          
        case 'clear':
          console.clear();
          showWelcome();
          prompt();
          break;
          
        case 'demo':
          await runDemo();
          prompt();
          break;
          
        default:
          // Reproduzir bip de escuta
          beepListening();
          
          // Processar como comando de voz
          await processVoiceCommand(input);
          prompt();
      }
    });
  };
  
  prompt();
}

// Iniciar
main().catch(console.error);
