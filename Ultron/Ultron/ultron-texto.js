#!/usr/bin/env node

/**
 * ULTRON - Modo Texto (Sem Voz)
 * 
 * Se o microfone não funcionar, você pode:
 * - Digitar seus comandos no terminal
 * - Ultron ainda responde por voz (TTS)
 * - 100% funcional
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const aiCore = require('./app/voice/ultron_ai_core.js');
const voiceLogger = require('./app/voice/voice_logger_simple');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

// TTS - Falar
function speak(text) {
  try {
    const tempFile = path.join(__dirname, '.tts_temp.txt');
    fs.writeFileSync(tempFile, text, 'utf8');
    
    const psCommand = `$text = [System.IO.File]::ReadAllText('${tempFile}', [System.Text.Encoding]::UTF8); Add-Type -AssemblyName System.Speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.Rate = 0; $speak.Volume = 100; $speak.Speak($text); Remove-Item '${tempFile}' -Force`;
    
    const { execSync } = require('child_process');
    execSync(`powershell -NoProfile -Command "${psCommand}"`, { stdio: 'pipe' });
  } catch (error) {
    // Silenciosamente continuar
  }
}

// Processar comando com IA
async function processWithAI(input) {
  console.log(`${colors.cyan}[VOCÊ DIGITOU]${colors.reset} "${input}"\n`);
  
  const result = await aiCore.processUltronCommand(input);
  
  if (result.type === 'response') {
    // Resposta simples (IA genérica)
    console.log(`${colors.green}[RESPOSTA]${colors.reset} ${result.response}\n`);
    speak(result.response);
  } else if (result.type === 'execution') {
    // Comando que requer execução
    console.log(`${colors.yellow}[AÇÃO SOLICITADA]${colors.reset} ${result.action}`);
    console.log(`${colors.yellow}[COMANDO]${colors.reset} "${input}"\n`);
    
    // Pedir confirmação
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question(`${colors.bright}[AUTORIZAR?]${colors.reset} Digite 'sim' para autorizar ou 'não' para cancelar: `, async (answer) => {
        rl.close();
        
        if (answer.toLowerCase() === 'sim' || answer.toLowerCase() === 's') {
          console.log(`${colors.green}[EXECUTANDO]${colors.reset} Processando...\n`);
          
          const actionResult = await aiCore.executeUltronAction(result.action, input);
          console.log(`${colors.green}[RESULTADO]${colors.reset} ${actionResult}\n`);
          
          speak(actionResult);
          
          // Registrar no log
          voiceLogger.auditLog({
            event_type: 'command_executed',
            input_text: input,
            action: result.action,
            result: actionResult,
            status: 'executed',
            timestamp: new Date().toISOString()
          });
        } else {
          console.log(`${colors.red}[CANCELADO]${colors.reset} Ação cancelada.\n`);
          speak('Ação cancelada.');
        }
        
        resolve();
      });
    });
  }
}

function showWelcome() {
  console.clear();
  console.log(`
${colors.bright}${colors.magenta}╔════════════════════════════════════════════════════════╗${colors.reset}
${colors.bright}${colors.magenta}║                                                        ║${colors.reset}
${colors.bright}${colors.magenta}║   💬 ULTRON - MODO TEXTO (SEM VOZ)                    ║${colors.reset}
${colors.bright}${colors.magenta}║                                                        ║${colors.reset}
${colors.bright}${colors.magenta}║   Digite comandos + Ultron responde por voz!          ║${colors.reset}
${colors.bright}${colors.magenta}║                                                        ║${colors.reset}
${colors.bright}${colors.magenta}╚════════════════════════════════════════════════════════╝${colors.reset}

${colors.green}✅ O QUE VOCÊ PODE FAZER AGORA:${colors.reset}

  📝 Fazer perguntas:
     "Qual é a data?"
     "Como está o sistema?"
     "Qual é o uptime?"
     "Como você funciona?"

  ⚡ Executar comandos (COM AUTORIZAÇÃO):
     "Abrir notepad"
     "Listar arquivos"
     "Criar arquivo teste.txt"
     "Executar comando ipconfig"
     "Rodar um programa"

  🔊 Ultron responde por voz!

${colors.yellow}📋 Como usar:${colors.reset}

  1. Digite seu comando no terminal
  2. Pressione ${colors.bright}ENTER${colors.reset}
  3. Ultron processa e responde
  4. Se for execução, autorize quando pedido

${colors.cyan}💡 Exemplos:${colors.reset}
  "qual é a hora"
  "abrir google chrome"
  "que informações você tem"
  "métricas do sistema"
  "criar arquivo de teste"
  "listar arquivos"

${colors.red}❌ Para sair: Digite 'sair' ou 'exit'${colors.reset}

  `);
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
      if (input.toLowerCase() === 'sair' || input.toLowerCase() === 'exit') {
        console.log(`\n${colors.yellow}[ENCERRAR]${colors.reset} Ultron desligando...\n`);
        speak('Até logo. Ultron desligando.');
        rl.close();
        process.exit(0);
      }
      
      if (input.trim() === '') {
        prompt();
        return;
      }
      
      // Processar entrada de texto
      console.log('');
      await processWithAI(input);
      prompt();
    });
  };
  
  prompt();
}

main().catch(console.error);
