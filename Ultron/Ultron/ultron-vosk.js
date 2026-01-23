#!/usr/bin/env node

/**
 * ULTRON - VOZ COM VOSK (Offline, Português)
 * 
 * ✅ Fala em português
 * ✅ Funciona OFFLINE
 * ✅ 100% gratuito
 * ✅ Sem Windows Speech Recognition
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Vosk, Model, Recognizer } = require('vosk');
const { execSync } = require('child_process');

const aiCore = require('./app/voice/ultron_ai_core.js');
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

// Caminho do modelo
const MODEL_PATH = path.join(__dirname, 'vosk_model');

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║   🎤 ULTRON - VOZ COM VOSK (OFFLINE)                 ║');
console.log('║   Fale em português naturalmente!                   ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// ===== Verificar modelo =====
if (!fs.existsSync(MODEL_PATH)) {
    console.log(`${colors.red}❌ Modelo Vosk não encontrado!${colors.reset}\n`);
    console.log('Execute primeiro:\n');
    console.log('  node setup-vosk.js\n');
    process.exit(1);
}

console.log(`${colors.green}✅ Modelo carregado${colors.reset}\n`);

// ===== TTS - FALAR =====
function speak(text) {
    try {
        const psCommand = `Add-Type -AssemblyName System.Speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.Rate = 0; $speak.Volume = 100; $speak.Speak('${text.replace(/'/g, "''")}')`;
        execSync(`powershell -NoProfile -Command "${psCommand}"`, { stdio: 'pipe', timeout: 15000 });
    } catch (e) {
        // Ignorar erros
    }
}

// ===== STT COM VOSK =====
async function captureVoiceWithVosk() {
    return new Promise((resolve) => {
        try {
            // Carregar modelo
            const model = new Model(MODEL_PATH);
            const rec = new Recognizer({ model, sampleRate: 16000 });
            rec.setWords(null);

            let partialResult = '';
            let finalResult = '';
            let isListening = true;

            console.log(`${colors.yellow}🎤 Escutando... (fale agora!)${colors.reset}`);

            // Timeout de 10 segundos
            const timeout = setTimeout(() => {
                isListening = false;
                rec.free();
                model.free();
                resolve(finalResult || partialResult);
            }, 10000);

            // Tentar capturar áudio
            try {
                const speaker = require('speaker');
                const mic = require('mic');

                const micInstance = mic({
                    rate: '16000',
                    channels: '1',
                    debug: false,
                    exitOnSilence: 6
                });

                const micStream = micInstance.getAudioStream();

                micStream.on('data', (data) => {
                    if (rec.acceptWaveform(data)) {
                        const result = JSON.parse(rec.result());
                        if (result.result && result.result.length > 0) {
                            finalResult = result.result.map(r => r.conf > 0.5 ? r.result : '').join(' ').trim();
                        }
                    } else {
                        const partial = JSON.parse(rec.getPartialResult());
                        if (partial.result) {
                            partialResult = partial.result;
                        }
                    }
                });

                micStream.on('error', () => {
                    isListening = false;
                    clearTimeout(timeout);
                    micInstance.stop();
                    rec.free();
                    model.free();
                    resolve(finalResult || partialResult);
                });

            } catch (e) {
                // Fallback se speaker/mic não estiver disponível
                console.log(`${colors.yellow}💡 Use digitação: digite seu comando${colors.reset}`);
                clearTimeout(timeout);
                rec.free();
                model.free();
                resolve(null);
            }

        } catch (e) {
            console.log(`${colors.red}❌ Erro ao capturar: ${e.message}${colors.reset}`);
            resolve(null);
        }
    });
}

// ===== INTERFACE =====
async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const prompt = () => {
        rl.question(`\n${colors.cyan}[ENTER=FALAR | Digite comando | 'sair'] =>${colors.reset} `, async (input) => {
            if (input.toLowerCase() === 'sair') {
                console.log(`\n${colors.green}✅ Até logo!${colors.reset}\n`);
                rl.close();
                process.exit(0);
            }

            let command = input.trim();

            // Se vazio, tenta capturar voz
            if (!command) {
                command = await captureVoiceWithVosk();
                if (!command) {
                    console.log(`${colors.red}❌ Nenhuma voz capturada${colors.reset}`);
                    prompt();
                    return;
                }
                console.log(`${colors.green}✅ Entendi: "${command}"${colors.reset}`);
            }

            console.log(`\n${colors.magenta}[PROCESSANDO] "${command}"${colors.reset}\n`);

            try {
                const result = cmdExecutor.parseAndExecuteCommand(command);

                if (result && result.success) {
                    const response = result.response || '✅ Executado!';
                    console.log(`${colors.green}${response}${colors.reset}\n`);
                    setTimeout(() => speak(response), 500);
                } else {
                    const msg = result?.error || '❌ Não entendi';
                    console.log(`${colors.red}${msg}${colors.reset}\n`);
                    speak('Não entendi. Tente novamente.');
                }
            } catch (e) {
                console.log(`${colors.red}❌ Erro: ${e.message}${colors.reset}\n`);
            }

            setTimeout(() => prompt(), 1500);
        });
    };

    prompt();
}

main().catch(e => {
    console.error(`${colors.red}❌ Erro: ${e.message}${colors.reset}`);
    process.exit(1);
});
