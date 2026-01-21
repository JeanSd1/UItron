#!/usr/bin/env node

/**
 * ULTRON - VOZ REAL COM FALLBACK
 * 
 * Você FALA por microfone
 * Se não funcionar, você DIGITA
 * Ultron responde por VOZ sempre
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync, spawnSync } = require('child_process');
const aiCore = require('./app/voice/ultron_ai_core.js');
const voiceLogger = require('./app/voice/voice_logger_simple');
const cmdExecutor = require('./app/voice/command_executor.js');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

// ===== TTS - FALAR =====
function speak(text) {
  try {
    const tempFile = path.join(__dirname, '.tts_temp.txt');
    fs.writeFileSync(tempFile, text, 'utf8');
    
    const psCommand = `$text = [System.IO.File]::ReadAllText('${tempFile}', [System.Text.Encoding]::UTF8); Add-Type -AssemblyName System.Speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.Rate = 0; $speak.Volume = 100; $speak.Speak($text); Remove-Item '${tempFile}' -Force`;
    
    execSync(`powershell -NoProfile -Command "${psCommand}"`, { stdio: 'pipe', timeout: 30000 });
  } catch (error) {
    // Continuar mesmo se falhar
  }
}

// ===== STT - CAPTURAR VOZ =====
async function captureVoiceFromMicrophone() {
  return new Promise((resolve) => {
    try {
      console.log(`${colors.yellow}🎤 Fale agora...${colors.reset}`);
      
      // Script PowerShell simples e direto
      const psScript = `
      Add-Type -AssemblyName System.Speech;
      
      \$recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine;
      \$recognizer.LoadGrammar([System.Speech.Recognition.DictationGrammar]::new());
      \$recognizer.SetInputToDefaultAudioDevice();
      
      \$result = \$recognizer.Recognize(15000);
      
      if (\$result) {
          \$result.Text;
      }
      `;
      
      const scriptFile = path.join(__dirname, '.voice_capture.ps1');
      fs.writeFileSync(scriptFile, psScript, 'utf8');
      
      // Executar PowerShell
      const result = spawnSync('powershell', [
        '-ExecutionPolicy', 'Bypass',
        '-NoProfile',
        '-File', scriptFile
      ], {
        encoding: 'utf-8',
        timeout: 20000,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      // Limpar
      try {
        if (fs.existsSync(scriptFile)) {
          fs.unlinkSync(scriptFile);
        }
      } catch (e) {}
      
      if (result.stdout) {
        const text = result.stdout.trim();
        if (text && text.length > 2 && !text.toLowerCase().includes('error')) {
          resolve(text);
          return;
        }
      }
      
      resolve(null);
    } catch (error) {
      resolve(null);
    }
  });
}

// ===== PROCESSAR COM IA =====
async function processWithAI(input) {
  console.log(`${colors.cyan}[PROCESSANDO]${colors.reset} "${input}"\n`);
  
  // Primeiro tenta parsear como comando executável
  const parsedCmd = cmdExecutor.parseCommand(input);
  
  if (parsedCmd) {
    // É um comando que pode ser executado
    console.log(`${colors.yellow}[AÇÃO AVANÇADA DETECTADA]${colors.reset}\n`);
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question(`${colors.bright}[AUTORIZAR?]${colors.reset} sim/não: `, (answer) => {
        rl.close();
        
        if (answer.toLowerCase() === 'sim' || answer.toLowerCase() === 's') {
          console.log(`${colors.green}[EXECUTANDO COMANDO]${colors.reset}\n`);
          
          const result = cmdExecutor.executeAction(parsedCmd.action, parsedCmd.params);
          console.log(`${colors.green}[RESULTADO]${colors.reset} ${result}\n`);
          
          speak(result);
          
          voiceLogger.auditLog({
            event_type: 'advanced_command_executed',
            input_text: input,
            action: parsedCmd.action,
            params: parsedCmd.params,
            result: result,
            status: 'executed'
          });
        } else {
          console.log(`${colors.red}[CANCELADO]\n`);
          speak('Ação cancelada.');
        }
        
        resolve();
      });
    });
  }
  
  // Caso contrário, processa com IA core
  const result = await aiCore.processUltronCommand(input);
  
  if (result.type === 'response') {
    // Resposta simples
    console.log(`${colors.green}[ULTRON]${colors.reset} ${result.response}\n`);
    speak(result.response);
  } else if (result.type === 'execution') {
    // Comando que requer execução
    console.log(`${colors.yellow}[AÇÃO]${colors.reset} ${result.action}`);
    console.log(`${colors.yellow}[COMANDO]${colors.reset} "${input}"\n`);
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question(`${colors.bright}[AUTORIZAR?]${colors.reset} sim/não: `, async (answer) => {
        rl.close();
        
        if (answer.toLowerCase() === 'sim' || answer.toLowerCase() === 's') {
          console.log(`${colors.green}[EXECUTANDO]${colors.reset}\n`);
          
          const actionResult = await aiCore.executeUltronAction(result.action, input);
          console.log(`${colors.green}[RESULTADO]${colors.reset} ${actionResult}\n`);
          
          speak(actionResult);
          
          voiceLogger.auditLog({
            event_type: 'command_executed',
            input_text: input,
            action: result.action,
            result: actionResult,
            status: 'executed'
          });
        } else {
          console.log(`${colors.red}[CANCELADO]\n`);
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
${colors.bright}${colors.magenta}║   🎤 ULTRON - VOZ REAL (FALE COM SEU MICROFONE)       ║${colors.reset}
${colors.bright}${colors.magenta}║                                                        ║${colors.reset}
${colors.bright}${colors.magenta}║   Você fala → Ultron processa → Responde por voz!    ║${colors.reset}
${colors.bright}${colors.magenta}║                                                        ║${colors.reset}
${colors.bright}${colors.magenta}╚════════════════════════════════════════════════════════╝${colors.reset}

${colors.green}✅ COMO USAR:${colors.reset}

  1. Pressione ${colors.bright}ENTER${colors.reset} para ativar o microfone
  2. ${colors.bright}FALE seu comando${colors.reset}} (até 15 segundos)
  3. Ultron processa e ${colors.bright}RESPONDE POR VOZ${colors.reset}} 🔊
  4. Se for execução, autorize digitando ${colors.bright}sim${colors.reset}}

${colors.cyan}💡 EXEMPLOS DE COMANDOS:${colors.reset}}

  "qual é a hora"
  "como está o sistema"
  "abrir novo documento de texto"
  "abra novo documento de texto e escreve olá mundo"
  "escreva olá mundo em arquivo"
  "listar arquivos"
  "abrir notepad"

${colors.yellow}📋 DICAS:${colors.reset}}

  • Fale em tom normal e claro
  • Minimize ruído de fundo
  • Use comandos simples e diretos
  • Não grite, fale naturalmente
  • Se não capturar, você pode digitar

${colors.red}❌ PARA SAIR: Digite 'sair'${colors.reset}}

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
    rl.question(`${colors.cyan}[ENTER para falar ou digite 'sair']${colors.reset} > `, async (input) => {
      if (input.toLowerCase() === 'sair' || input.toLowerCase() === 'exit') {
        console.log(`\n${colors.yellow}[ULTRON DESLIGANDO]${colors.reset}\n`);
        speak('Até logo. Ultron desligando.');
        rl.close();
        process.exit(0);
      }
      
      // Se vazio = FALAR
      if (input === '') {
        console.log('');
        const voiceInput = await captureVoiceFromMicrophone();
        
        if (voiceInput) {
          console.log(`${colors.green}[VOZ CAPTURADA]${colors.reset} "${voiceInput}"\n`);
          await processWithAI(voiceInput);
        } else {
          console.log(`${colors.yellow}[NÃO CAPTUROU]${colors.reset} Tente novamente ou ${colors.bright}DIGITE seu comando${colors.reset}}\n`);
          speak('Não consegui capturar. Tente novamente.');
        }
      } else {
        // Se digitou algo = PROCESSAR
        console.log('');
        await processWithAI(input);
      }
      
      prompt();
    });
  };
  
  prompt();
}

main().catch(console.error);
