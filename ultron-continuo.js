#!/usr/bin/env node
/**
 * ULTRON — MODO SEMPRE ATIVO (FILA NÃO-BLOQUEANTE)
 * ✅ FFmpeg stream contínuo
 * ✅ Vosk processando real-time
 * ✅ Fila desacoplada de execução
 * ✅ SEM await, SEM bloqueio, SEM travamento
 * ✅ Assistente de verdade
 */

const { spawn } = require("child_process");
const fs = require("fs");
const vosk = require("vosk");
const executor = require("./app/voice/executor_robusto");
const { interpretarComando } = require("./app/voice/intent_parser");

// ================= CONFIG =================
const MODEL_PATH = "./vosk-model";
const MICROFONE = "Headset (E6S Hands-Free AG Audio)";

// ================= FILA DE COMANDOS (NÃO-BLOQUEANTE) =================
const commandQueue = [];
let executing = false;

function enqueueCommand(text) {
  // Validação rápida
  if (!isValidCommand(text)) return;
  
  // Interpretar intenção
  const intent = interpretarComando(text);
  if (!intent) {
    console.log(`❌ Comando não reconhecido: ${text}`);
    return;
  }

  console.log(`📝 Você disse: "${text}"`);
  console.log(`🎯 Intenção: ${intent.descricao}`);
  
  commandQueue.push(intent);
  processQueue();
}

function processQueue() {
  if (executing) return;
  if (commandQueue.length === 0) return;

  executing = true;
  const command = commandQueue.shift();

  // Executar sem bloqueio
  executarComandoAsync(command, () => {
    executing = false;
    // Continua fila SEM travar
    setImmediate(processQueue);
  });
}

// ================= EXECUTOR NÃO-BLOQUEANTE =================
function executarComandoAsync(intent, callback) {
  // Se é intenção parsed
  if (intent.type === "url") {
    spawn("cmd", ["/c", "start", "", intent.value], {
      detached: true,
      stdio: "ignore",
      windowsHide: true
    }).unref();
    
    console.log(`✅ ${intent.descricao}`);
    callback();
    return;
  }

  if (intent.type === "app") {
    spawn("cmd", ["/c", "start", "", intent.value], {
      detached: true,
      stdio: "ignore",
      windowsHide: true
    }).unref();
    
    console.log(`✅ ${intent.descricao}`);
    callback();
    return;
  }

  // Fallback: trata como comando de texto (executor original)
  executor.executar(intent.value || intent)
    .then((resultado) => {
      console.log(`${resultado.sucesso ? "✅" : "❌"} ${resultado.msg}`);
      callback();
    })
    .catch((err) => {
      console.error(`❌ Erro: ${err.message}`);
      callback();
    });
}

// ================= FILTROS =================
function isValidCommand(text) {
  if (!text) return false;
  const trimmed = text.trim();
  if (trimmed.length < 3) return false;
  
  // Filtrar ruído comum
  const RUIDO = ["o", "a", "um", "uma", "e", "ou", "ouu", "aaa", "oo"];
  if (RUIDO.includes(trimmed)) return false;
  
  return true;
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
║ 🎙️  ULTRON — SEMPRE ATIVO (FILA DESACOPLADA)       ║
║ Escutando continuamente...                            ║
║ Modelo PT-BR carregado ✅                             ║
║ Execução paralela não-bloqueante ✅                    ║
╚════════════════════════════════════════════════════════╝
`);

// ================= STREAM CONTÍNUO =================
function iniciarStreamContinuo() {
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

  // Stream: FFmpeg → Vosk → Fila
  ffmpeg.stdout.on("data", (chunk) => {
    if (recognizer.acceptWaveform(chunk)) {
      // Resultado final
      const result = recognizer.result();
      if (result && result.text) {
        // ✅ NÃO bloqueia — apenas enfileira
        enqueueCommand(result.text);
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
