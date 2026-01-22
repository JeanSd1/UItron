#!/usr/bin/env node

/**
 * ULTRON - MODO HÍBRIDO
 * 
 * ✅ Tenta falar (microfone)
 * ✅ Se não conseguir, pede para DIGITAR
 * ✅ Funciona tanto com voz quanto texto
 * ✅ FICA ABERTO PARA SEMPRE
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync, spawnSync } = require('child_process');

// Importar módulos Ultron
const aiCore = require('./app/voice/ultron_ai_core.js');
const cmdExecutor = require('./app/voice/command_executor.js');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m'
};

// ===== TTS - FALAR =====
function speak(text) {
  try {
    const psCommand = `Add-Type -AssemblyName System.Speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.Rate = 0; $speak.Volume = 100; $speak.Speak('${text.replace(/'/g, "''")}')`;
    execSync(`powershell -NoProfile -Command "${psCommand}"`, { stdio: 'pipe', timeout: 15000 });
  } catch (e) {
    // Ignorar erros de TTS
  }
}

// ===== STT - CAPTURAR VOZ (COM TIMEOUT) =====
async function captureVoiceTimeout(seconds = 10) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(null); // Timeout = nenhuma voz capturada
    }, seconds * 1000 + 2000); // +2s de margem

    try {
      const psScript = `
      Add-Type -AssemblyName System.Speech;
      $recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine;
      $recognizer.LoadGrammar([System.Speech.Recognition.DictationGrammar]::new());
      $recognizer.SetInputToDefaultAudioDevice();
      $result = $recognizer.Recognize(${seconds}000);
      if ($result) { $result.Text; }
      `;

      const result = spawnSync('powershell', ['-NoProfile', '-Command', psScript], {
        encoding: 'utf-8',
        timeout: (seconds + 5) * 1000,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      clearTimeout(timer);

      if (result.stdout && result.stdout.trim()) {
        resolve(result.stdout.trim());
      } else {
        resolve(null);
      }
    } catch (e) {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

// ===== INTERFACE INTERATIVA =====
async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   🎤 ULTRON - MODO HÍBRIDO (VOZ + TEXTO)              ║');
  console.log('║   Fale ou DIGITE - Ambos funcionam!                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  const prompt = () => {
    rl.question(`${colors.cyan}[ENTER=FALAR | Digite comando | 'sair']=>${colors.reset} `, async (input) => {
      if (input.toLowerCase() === 'sair') {
        console.log(`\n${colors.green}✅ Até logo!${colors.reset}\n`);
        rl.close();
        process.exit(0);
      }

      let command = input.trim();

      // Se vazio (pressionou ENTER), tenta capturar voz
      if (!command) {
        console.log(`\n${colors.yellow}🎙️  Aguardando voz... (10 segundos)${colors.reset}`);
        const voice = await captureVoiceTimeout(10);

        if (voice && voice.length > 0) {
          console.log(`${colors.green}✅ Capturado: "${voice}"${colors.reset}\n`);
          command = voice;
        } else {
          console.log(`${colors.red}❌ Nenhuma voz capturada${colors.reset}`);
          console.log(`${colors.yellow}💡 Digite seu comando aqui e pressione ENTER:\n${colors.reset}`);
          prompt(); // Volta para pedir input
          return;
        }
      }

      // Processar comando
      console.log(`\n${colors.magenta}[PROCESSANDO] "${command}"${colors.reset}\n`);

      try {
        // Tentar executar como comando
        const result = cmdExecutor.parseAndExecuteCommand(command);

        if (result && result.success) {
          const response = result.response || '✅ Executado com sucesso!';
          console.log(`${colors.green}${response}${colors.reset}\n`);
          
          // Falar resposta
          setTimeout(() => speak(response), 500);
        } else {
          const errorMsg = result?.error || '❌ Comando não entendido';
          console.log(`${colors.red}${errorMsg}${colors.reset}\n`);
          speak('Não entendi. Tente novamente.');
        }
      } catch (e) {
        console.log(`${colors.red}❌ Erro: ${e.message}${colors.reset}\n`);
      }

      // Próximo comando
      setTimeout(() => prompt(), 1500);
    });
  };

  prompt();
}

// Iniciar
main().catch(e => {
  console.error(`${colors.red}❌ Erro fatal: ${e.message}${colors.reset}`);
  process.exit(1);
});
