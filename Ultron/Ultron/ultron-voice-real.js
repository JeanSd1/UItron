#!/usr/bin/env node

/**
 * ULTRON - Voice Recognition Real
 * 
 * Captura sua voz do microfone, processa com Ultron e responde falando
 * 
 * Uso:
 *   node ultron-voice-real.js
 * 
 * Pressione ESC para sair
 */

const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const voiceAdapter = require('./app/voice/voice_adapter_simple');
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

let isListening = false;

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

// STT - Capturar voz do microfone
async function captureVoice() {
  return new Promise((resolve) => {
    try {
      console.log(`${colors.yellow}🎤 Escutando...${colors.reset}`);
      
      // Script PowerShell para capturar fala
      const psScript = `
      Add-Type -AssemblyName System.Speech;
      Add-Type -AssemblyName System.Windows.Forms;
      
      # Criar um SpeechRecognitionEngine
      \$recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine;
      \$recognizer.LoadGrammar([System.Speech.Recognition.DictationGrammar]::new());
      
      # Usar microfone padrão
      \$recognizer.SetInputToDefaultAudioDevice();
      
      try {
          # Aguardar até 10 segundos por fala
          \$result = \$recognizer.Recognize(10000);
          
          if (\$result) {
              Write-Output \$result.Text
          } else {
              Write-Output "No speech detected"
          }
      } catch {
          Write-Output "Error: \$(\$_.Exception.Message)"
      }
      `;
      
      const scriptFile = path.join(__dirname, '.voice_script.ps1');
      fs.writeFileSync(scriptFile, psScript, 'utf8');
      
      exec(`powershell -ExecutionPolicy Bypass -NoProfile -File "${scriptFile}"`, 
        { timeout: 15000 },
        (error, stdout, stderr) => {
          try {
            if (fs.existsSync(scriptFile)) {
              fs.unlinkSync(scriptFile);
            }
          } catch (e) {
            // Ignorar erro de limpeza
          }
          
          if (error) {
            resolve('No speech detected');
          } else {
            const text = stdout.trim();
            if (text && text !== 'No speech detected') {
              resolve(text);
            } else {
              resolve('No speech detected');
            }
          }
        }
      );
    } catch (error) {
      resolve('No speech detected');
    }
  });
}

// Processar fala com Ultron
async function processVoice(spokenText) {
  if (spokenText === 'No speech detected' || !spokenText) {
    console.log(`${colors.yellow}[VAZIO]${colors.reset} Nenhuma fala detectada\n`);
    return false;
  }
  
  console.log(`${colors.cyan}[VOCÊ FALOU]${colors.reset} "${spokenText}\n"`);
  
  const startTime = Date.now();
  const sessionId = voiceLogger.generateSessionId();
  
  try {
    // Rotear intenção
    const intentRouter = require('./app/voice/intent_router_simple');
    const route = intentRouter.routeIntent(spokenText.toLowerCase());
    
    if (!route.success || !route.allowed) {
      console.log(`${colors.red}[BLOQUEADO]${colors.reset} ${route.reason || 'Comando não permitido'}\n`);
      
      speak('Este comando não é permitido por questões de segurança.');
      
      voiceLogger.auditLog({
        event_type: 'blocked',
        input_text: spokenText,
        reason: route.reason,
        status: 'blocked',
        session_id: sessionId,
        processing_time_ms: Date.now() - startTime
      });
      
      return false;
    }
    
    // Gerar resposta
    const voiceResponder = require('./app/voice/voice_responder_simple');
    const response = voiceResponder.generateResponse(route.intent);
    
    console.log(`${colors.green}[DETECTADO]${colors.reset} Intent: ${colors.bright}${route.intent}${colors.reset}`);
    console.log(`${colors.cyan}[RESPOSTA]${colors.reset} "${response.response_text}"\n`);
    
    // Falar resposta
    console.log(`${colors.yellow}🔊 Falando...${colors.reset}`);
    speak(response.response_text);
    
    // Registrar
    voiceLogger.auditLog({
      event_type: 'voice_command_real',
      input_text: spokenText,
      intent: route.intent,
      response_text: response.response_text,
      status: 'success',
      session_id: sessionId,
      processing_time_ms: Date.now() - startTime
    });
    
    console.log(`${colors.green}✓ Processado${colors.reset}\n`);
    return true;
    
  } catch (error) {
    console.log(`${colors.red}[ERRO]${colors.reset} ${error.message}\n`);
    speak('Ocorreu um erro ao processar seu comando.');
    return false;
  }
}

function showWelcome() {
  console.clear();
  console.log(`
${colors.bright}${colors.magenta}╔════════════════════════════════════════════════════════╗${colors.reset}
${colors.bright}${colors.magenta}║                                                        ║${colors.reset}
${colors.bright}${colors.magenta}║   🎤 ULTRON - VOZ REAL (Microfone)                    ║${colors.reset}
${colors.bright}${colors.magenta}║                                                        ║${colors.reset}
${colors.bright}${colors.magenta}║   Fale com seu microfone e Ultron responde!          ║${colors.reset}
${colors.bright}${colors.magenta}║                                                        ║${colors.reset}
${colors.bright}${colors.magenta}╚════════════════════════════════════════════════════════╝${colors.reset}

${colors.cyan}📝 Como usar:${colors.reset}

1. Pressione ${colors.bright}ENTER${colors.reset} para ativar o microfone
2. Fale seu comando (máximo 10 segundos)
3. Ultron processa e responde por voz 🔊

${colors.green}✓ Exemplos:${colors.reset}
  • "qual é o status"
  • "mostrar métricas"
  • "histórico completo"
  • "como você funciona"
  • "ajuda"

${colors.yellow}⚠️  Palavras-chave bloqueadas:${colors.reset}
  executar, rodar, apagar, deletar, modificar, alterar, forçar

${colors.red}❌ Para sair: Digite 'sair' ou 'exit'${colors.reset}

  `);
}

async function main() {
  showWelcome();
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });
  
  const prompt = () => {
    rl.question(`${colors.cyan}[Pressione ENTER para falar]${colors.reset} > `, async (input) => {
      if (input.toLowerCase() === 'sair' || input.toLowerCase() === 'exit') {
        console.log(`\n${colors.yellow}[ENCERRAR]${colors.reset} Ultron desligando...\n`);
        speak('Até logo. Ultron desligando.');
        rl.close();
        process.exit(0);
      }
      
      if (input === '') {
        console.log('');
        const voiceInput = await captureVoice();
        await processVoice(voiceInput);
      }
      
      prompt();
    });
  };
  
  prompt();
}

// Iniciar
main().catch(console.error);
