#!/usr/bin/env node

/**
 * ULTRON - Voice Interface Completa com IA e Execução
 * 
 * Agora você pode:
 * 1. Perguntar o que quiser
 * 2. Ultron executa comandos no seu PC
 * 3. Tudo por voz!
 */

const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const aiCore = require('./app/voice/ultron_ai_core.js');
const voiceLogger = require('./app/voice/voice_logger_simple');
const sttImproved = require('./app/voice/voice_stt_improved.js');

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
    
    execSync(`powershell -NoProfile -Command "${psCommand}"`, { stdio: 'pipe' });
  } catch (error) {
    // Silenciosamente continuar
  }
}

// STT - Capturar voz
async function captureVoice() {
  console.log(`${colors.yellow}🎤 Escutando por 15 segundos...${colors.reset}`);
  
  // Usar STT melhorado
  const voiceInput = await sttImproved.captureVoiceImproved();
  
  if (voiceInput) {
    return voiceInput;
  }
  
  // Se falhar, mostrar dica
  console.log(`${colors.yellow}[VAZIO]${colors.reset} Nenhuma fala detectada.\n`);
  console.log(`${colors.cyan}💡 DICAS:${colors.reset}`);
  console.log(`   1. Fale em tom normal e claro`);
  console.log(`   2. Minimize ruído de fundo`);
  console.log(`   3. Não comece a falar muito rápido após pressionar ENTER`);
  console.log(`   4. Ou ${colors.bright}DIGITE seu comando${colors.reset} no terminal\n`);
  
  return null;
}

// Processar comando com IA
async function processWithAI(input) {
  console.log(`${colors.cyan}[VOCÊ FALOU]${colors.reset} "${input}"\n`);
  
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
${colors.bright}${colors.magenta}║   🎤 ULTRON - COPILOTO COM IA E EXECUÇÃO              ║${colors.reset}
${colors.bright}${colors.magenta}║                                                        ║${colors.reset}
${colors.bright}${colors.magenta}║   Fale + Ultron faz!                                  ║${colors.reset}
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

  1. Pressione ${colors.bright}ENTER${colors.reset} para ativar microfone
  2. Fale seu comando (máximo 10 segundos)
  3. Ultron processa e responde
  4. Se for execução, autorize quando pedido

${colors.cyan}💡 Exemplos:${colors.reset}
  "qual é a hora"
  "abrir google chrome"
  "que informações você tem"
  "métricas do sistema"

${colors.red}❌ Para sair: Digite 'sair' ou 'exit'${colors.reset}

  `);
}

async function main() {
  showWelcome();
  
  // Fazer diagnóstico de microfone
  const hasMic = await sttImproved.voiceDiagnostics();
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });
  
  const prompt = () => {
    rl.question(`${colors.cyan}[Pressione ENTER para falar ou digite comando]${colors.reset} > `, async (input) => {
      if (input.toLowerCase() === 'sair' || input.toLowerCase() === 'exit') {
        console.log(`\n${colors.yellow}[ENCERRAR]${colors.reset} Ultron desligando...\n`);
        speak('Até logo. Ultron desligando.');
        rl.close();
        process.exit(0);
      }
      
      // Se vazio, capturar voz
      if (input === '') {
        console.log('');
        const voiceInput = await captureVoice();
        
        if (voiceInput) {
          await processWithAI(voiceInput);
        } else {
          console.log(`${colors.yellow}[VAZIO]${colors.reset} Nenhuma fala detectada. Tente novamente.\n`);
          speak('Desculpe, não consegui capturar sua fala. Tente novamente.');
        }
      } else {
        // Processar entrada de texto
        await processWithAI(input);
      }
      
      prompt();
    });
  };
  
  prompt();
}

main().catch(console.error);
