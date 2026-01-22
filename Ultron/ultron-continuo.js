#!/usr/bin/env node
/**
 * ULTRON — MODO CONTÍNUO (ESCUTA 24/7)
 * ✅ FFmpeg stream contínuo
 * ✅ Vosk processando real-time
 * ✅ Sempre ativo - sem ENTER
 * ✅ Reconhece comandos automaticamente
 * ✅ Executa sem delay
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const vosk = require("vosk");
const { containsHotword, stripHotword } = require("./app/voice/hotword_listener");
const executor = require("./app/voice/executor_robusto");

// ================= CONFIG =================
const MICROFONE = "Microfone (2- High Definition Audio Device)";
const MODEL_PATH = path.join(__dirname, "vosk-model");

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
║ 🎤 ULTRON — MODO CONTÍNUO (ESCUTA 24/7)              ║
║ Diga seus comandos em Português                       ║
║ Modelo PT-BR carregado ✅                             ║
║ Sem apertar ENTER - sempre ativo                      ║
╚════════════════════════════════════════════════════════╝
`);
console.log("🎧 Escutando... (Ctrl+C para sair)\n");

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
    // Silenciar erros de fala
  }
}

// ================= HANDLER DE VOZ =================
async function handleSpeech(texto) {
  if (!texto || texto.trim().length === 0) return;

  const clean = normalizeCommand(texto);
  
  if (clean.length === 0) return;

  console.log(`\n📝 Você disse: "${texto}"`);
  console.log(`🔧 Comando: "${clean}"`);
  
  try {
    const resultado = await executor.executar(clean);
    console.log(`${resultado.sucesso ? "✅" : "❌"} ${resultado.msg}\n`);
    
    if (resultado.sucesso) {
      speak("Executado com sucesso");
    }
  } catch (e) {
    console.error("[ERRO]", e.message);
    speak("Erro ao executar");
  }
}

// ================= STREAM CONTÍNUO =================
function iniciarStreamContinuo() {
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
    console.error("❌ Erro FFmpeg:", err.message);
    process.exit(1);
  });

  ffmpeg.stderr.on("data", (data) => {
    // Ignorar logs do FFmpeg
  });

  // Inicializar Vosk recognizer
  recognizer = new vosk.Recognizer({ model, sampleRate: 16000 });

  let chunks = 0;
  
  // Stream: FFmpeg → Vosk
  ffmpeg.stdout.on("data", (chunk) => {
    chunks++;
    // Mostrar indicador a cada 10 chunks
    if (chunks % 10 === 0) {
      process.stdout.write(".");
    }
    
    if (recognizer.acceptWaveform(chunk)) {
      // Resultado final
      const result = recognizer.result();
      if (result && result.text && result.text.trim()) {
        process.stdout.write("\n");
        handleSpeech(result.text);
        chunks = 0;
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
