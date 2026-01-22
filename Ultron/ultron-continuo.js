#!/usr/bin/env node
/**
 * ULTRON — MODO CONTÍNUO (5.1.4)
 * ✅ FFmpeg stream contínuo
 * ✅ Vosk processando real-time
 * ✅ Hotword "oi ultron"
 * ✅ State machine IDLE → AWAKE → PROCESSING
 * ✅ Sem ENTER, sem terminal interativo
 */

const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const vosk = require("vosk");
const { containsHotword, stripHotword } = require("./app/voice/hotword_listener");
const executor = require("./app/voice/executor_robusto");

// ================= CONFIG =================
const MICROFONE = "Microfone (2- High Definition Audio Device)";
const MODEL_PATH = path.join(__dirname, "vosk-model");

// ================= STATE MACHINE =================
let STATE = "IDLE"; // IDLE | AWAKE | PROCESSING
const STATES = {
  IDLE: "IDLE",
  AWAKE: "AWAKE",
  PROCESSING: "PROCESSING"
};

// ================= NORMALIZAR COMANDO =================
function normalizeCommand(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^outro\s+/g, "")      // "outro" = reconhecimento errado de "ultron"
    .replace(/^ultron\s+/g, "")     // remove "ultron" se vir correto
    .replace(/^oi\s+/g, "")         // remove "oi"
    .replace(/^ultra\s+/g, "")      // variações
    .trim();
}

// ================= VOSK SETUP =================
if (!fs.existsSync(MODEL_PATH)) {
  console.error("❌ Modelo Vosk não encontrado em:", MODEL_PATH);
  process.exit(1);
}

vosk.setLogLevel(0);
const model = new vosk.Model(MODEL_PATH);
let recognizer = null;

console.clear();
console.log(`
╔════════════════════════════════════════════════════════╗
║ 🎙️  ULTRON — MODO CONTÍNUO (HOTWORD)                 ║
║ Diga "Oi Ultron" para ativar                          ║
║ Modelo PT-BR carregado ✅                             ║
╚════════════════════════════════════════════════════════╝
`);

// ================= RESPOSTA POR VOZ =================
function speak(texto) {
  try {
    const cmd = `Add-Type -AssemblyName System.Speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.Rate = 0; $speak.Volume = 100; $speak.Speak('${texto.replace(/'/g, "''")}')`;
    
    spawn("powershell", ["-NoProfile", "-Command", cmd], {
      stdio: "ignore",
      detached: true,
      windowsHide: true
    }).unref();
  } catch (e) {
    console.error("[SPEAK ERROR]", e.message);
  }
}

// ================= HANDLER DE VOZ =================
async function handleSpeech(texto) {
  if (!texto || texto.trim().length === 0) return;

  const clean = normalizeCommand(texto);
  console.log(`📝 Transcrição RAW: "${texto}"`);
  console.log(`🔧 Comando limpo: "${clean}"`);

  if (clean.length === 0) return;

  // ✅ EXECUTA DIRETO (sem máquina de estados complicada)
  console.log(`🎯 EXECUTANDO: "${clean}"`);
  
  try {
    const resultado = await executor.executar(clean);
    console.log(`${resultado.sucesso ? "✅" : "❌"} ${resultado.msg}`);
    
    if (resultado.sucesso) {
      speak("Comando executado.");
    } else {
      speak("Erro ao executar o comando.");
    }
  } catch (e) {
    console.error("[EXEC ERROR]", e.message);
    speak("Erro no sistema.");
  }
}

// ================= STREAM CONTÍNUO =================
function iniciarStreamContinuo() {
  console.log("🎤 Iniciando escuta contínua...\n");

  const ffmpeg = spawn("ffmpeg", [
    "-f", "dshow",
    "-i", `audio=${MICROFONE}`,
    "-ar", "16000",
    "-ac", "1",
    "-f", "s16le",
    "-"
  ], {
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });

  ffmpeg.on("error", (err) => {
    console.error("❌ FFmpeg erro:", err.message);
    process.exit(1);
  });

  ffmpeg.stderr.on("data", (data) => {
    // Ignorar logs do FFmpeg
  });

  // Inicializar Vosk recognizer
  recognizer = new vosk.Recognizer({ model, sampleRate: 16000 });

  // Stream: FFmpeg → Vosk
  ffmpeg.stdout.on("data", (chunk) => {
    console.log(`🎧 Áudio recebido: ${chunk.length} bytes`);
    
    if (recognizer.acceptWaveform(chunk)) {
      // Resultado final
      const result = recognizer.result();
      console.log(`🧠 VOSK RESULT:`, result);
      if (result && result.text) {
        handleSpeech(result.text);
      }
    }
  });

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n\n✅ Ultron desligado.");
    recognizer.free();
    ffmpeg.kill();
    process.exit(0);
  });
}

// ================= START =================
iniciarStreamContinuo();
