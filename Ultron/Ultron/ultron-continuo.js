#!/usr/bin/env node
/**
 * ULTRON — MODO CONTÍNUO COM JANELA DE ATIVAÇÃO
 * ✅ FFmpeg stream contínuo
 * ✅ Vosk processando real-time
 * ✅ Hotword "Ultron" ativa janela de 10 segundos
 * ✅ Durante a janela: executa qualquer comando SEM repetir hotword
 * ✅ Após janela: exige "Ultron" novamente
 * ✅ Profissional e robusto
 */

const { spawn } = require("child_process");
const fs = require("fs");
const vosk = require("vosk");
const executor = require("./app/voice/executor_robusto");

// ================= CONFIG =================
const MODEL_PATH = "./vosk-model";
const MICROFONE = "Headset (E6S Hands-Free AG Audio)";
const JANELA_ATIVACAO_MS = 10000; // 10 segundos de janela

// ================= STATE =================
let ultronAtivoAte = 0; // Timestamp quando Ultron desativa

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
║ Diga "Oi Ultron" para ativar (10s window)             ║
║ Modelo PT-BR carregado ✅                             ║
╚════════════════════════════════════════════════════════╝
`);

// ================= DETECTOR HOTWORD (FUZZY) =================
function detectarHotword(texto) {
  if (!texto) return false;

  const t = texto.toLowerCase().trim();

  // Palavras-chave que o Vosk gera quando você fala "Oi Ultron"
  const HOTWORDS = [
    "ultron",
    "outro",      // Vosk ouve "ultron" como "outro"
    "otro",       // Variação
    "o tron",     // Divisão silábica
    "oi ultron",  // Exato
    "oi outro",   // Com "oi"
    "oi otro",    // Com "oi" + variação
  ];

  return HOTWORDS.some(h => t.includes(h));
}

// ================= HANDLER DE VOZ =================
async function handleSpeech(texto) {
  if (!texto || texto.trim().length === 0) return;

  const agora = Date.now();
  const ativo = agora <= ultronAtivoAte;

  console.log(`📝 Você disse: "${texto}"`);

  // LÓGICA 1: Detecta hotword (fuzzy)
  if (detectarHotword(texto)) {
    ultronAtivoAte = agora + JANELA_ATIVACAO_MS;
    console.log(`🔓 Ultron ativado por 10 segundos\n`);
    return;
  }

  // LÓGICA 2: Se não estiver ativo, ignora
  if (!ativo) {
    console.log(`🔇 Ultron inativo. Diga "Oi Ultron" para ativar.\n`);
    return;
  }

  // LÓGICA 3: Está ativo → EXECUTA o comando
  console.log(`⏱️  Ultron ativo (${Math.ceil((ultronAtivoAte - agora) / 1000)}s restantes)`);
  
  try {
    const resultado = await executor.executar(texto);
    console.log(`${resultado.sucesso ? "✅" : "❌"} ${resultado.msg}\n`);
  } catch (e) {
    console.error("[ERRO]", e.message);
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
    "pipe:1"
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
