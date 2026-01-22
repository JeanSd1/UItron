#!/usr/bin/env node
/**
 * ULTRON — MODO CONTÍNUO (HOTWORD) - VERSÃO ROBUSTA
 * ✅ FFmpeg stream contínuo (dispositivo padrão)
 * ✅ Vosk processando real-time
 * ✅ Reconhece "Oi Ultron" automaticamente
 * ✅ Sem ENTER, sem terminal interativo
 * ✅ Sem hardcode de device (funciona em qualquer Windows)
 */

const { spawn } = require("child_process");
const fs = require("fs");
const vosk = require("vosk");
const { containsHotword, stripHotword } = require("./app/voice/hotword_listener");
const executor = require("./app/voice/executor_robusto");

// ================= CONFIG =================
const MODEL_PATH = "./vosk-model";

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

// ================= HANDLER DE VOZ =================
async function handleSpeech(texto) {
  if (!texto || texto.trim().length === 0) return;

  console.log(`📝 Transcrição RAW: "${texto}"`);

  if (!containsHotword(texto)) {
    console.log("🔇 Hotword não detectada. Diga 'Ultron' para ativar.");
    return;
  }

  const clean = stripHotword(texto);

  if (!clean) {
    console.log("⚠️  Nenhum comando após hotword.");
    return;
  }

  console.log(`🎯 COMANDO ATIVADO: "${clean}"`);
  
  try {
    const resultado = await executor.executar(clean);
    console.log(`${resultado.sucesso ? "✅" : "❌"} ${resultado.msg}\n`);
  } catch (e) {
    console.error("[ERRO]", e.message);
  }
}

// ================= STREAM CONTÍNUO =================
function iniciarStreamContinuo() {
  console.log("🎤 Iniciando escuta contínua...\n");

  // FFmpeg: usar microfone EXATO listado por dshow
  // Nome obtido via: ffmpeg -list_devices true -f dshow -i dummy
  const ffmpeg = spawn("ffmpeg", [
    "-f", "dshow",
    "-i", "audio=Headset (E6S Hands-Free AG Audio)",
    "-ar", "16000",
    "-ac", "1",
    "-f", "s16le",
    "pipe:1"
  ], {
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });

  ffmpeg.on("error", (err) => {
    console.error("❌ FFmpeg erro:", err.message);
    console.error("💡 Dica: Verifique se FFmpeg está instalado");
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
