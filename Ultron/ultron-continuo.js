#!/usr/bin/env node
/**
 * ULTRON — MODO CONTÍNUO MELHORADO (5.2)
 * ✅ FFmpeg stream contínuo
 * ✅ Vosk processando real-time
 * ✅ Hotword "oi ultron" ou "ultron"
 * ✅ Melhor tratamento de erros
 * ✅ Logs detalhados
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// ================= CONFIG =================
const MODEL_PATH = path.join(__dirname, "vosk-model");

// Tentar carregar vosk
let vosk;
try {
  vosk = require("vosk");
} catch (e) {
  console.error("❌ VOSK não instalado! Execute: npm install vosk");
  process.exit(1);
}

const { containsHotword, stripHotword } = require("./app/voice/hotword_listener");
const executor = require("./app/voice/executor_robusto");

// ================= NOMES DE MICROFONE POSSÍVEIS =================
const MICROPHONES = [
  "Microfone (2- High Definition Audio Device)",
  "Microfone (High Definition Audio Device)",
  "Headset (E6S Hands-Free AG Audio)",
  "Microphone",
  "Mic",
];

// ================= VERIFICAÇÕES INICIAIS =================
console.clear();
console.log(`
╔════════════════════════════════════════════════════════╗
║ 🎙️  ULTRON — MODO CONTÍNUO MELHORADO v5.2            ║
║ Diga "Oi Ultron" ou "Ultron" para ativar             ║
║ Modelo PT-BR carregado ✅                             ║
╚════════════════════════════════════════════════════════╝
`);

if (!fs.existsSync(MODEL_PATH)) {
  console.error(`❌ Modelo Vosk não encontrado em: ${MODEL_PATH}`);
  console.error("Baixe com: npm install vosk");
  process.exit(1);
}

console.log(`✅ Modelo Vosk encontrado: ${MODEL_PATH}`);

// ================= NORMALIZAR COMANDO =================
function normalizeCommand(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

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
  
  // Verificar hotword
  if (!containsHotword(clean)) {
    console.log(`⏭️  Sem hotword detectado: "${clean}"`);
    return;
  }

  // Remover hotword
  const command = stripHotword(clean);
  
  console.log(`\n🎤 HOTWORD DETECTADO!`);
  console.log(`📝 Transcrição: "${texto}"`);
  console.log(`🔧 Normalizado: "${clean}"`);
  console.log(`🎯 Comando: "${command}"\n`);

  if (command.length === 0) {
    console.log("⚠️  Nenhum comando após hotword");
    speak("Nenhum comando detectado.");
    return;
  }

  // Executar comando
  try {
    const resultado = await executor.executar(command);
    console.log(`${resultado.sucesso ? "✅" : "❌"} ${resultado.msg}`);
    
    if (resultado.sucesso) {
      speak("Comando executado com sucesso.");
    } else {
      speak("Não consegui executar o comando.");
    }
  } catch (e) {
    console.error("[EXEC ERROR]", e.message);
    speak("Erro ao executar comando.");
  }
}

// ================= INICIAR STREAM =================
function iniciarStream() {
  console.log("🎤 Iniciando escuta contínua...");
  console.log("Fale 'Oi Ultron' ou 'Ultron' para ativar\n");

  // Tentar usar primeiro microfone disponível
  let microfone = MICROPHONES[0];
  
  console.log(`🔊 Usando microfone: ${microfone}`);

  // Inicializar Vosk
  vosk.setLogLevel(-1); // Desabilitar logs do Vosk
  let model;
  let recognizer;

  try {
    model = new vosk.Model(MODEL_PATH);
    recognizer = new vosk.Recognizer({ model, sampleRate: 16000 });
    console.log("✅ Vosk inicializado\n");
  } catch (e) {
    console.error("❌ Erro ao inicializar Vosk:", e.message);
    process.exit(1);
  }

  // Iniciar FFmpeg
  const ffmpeg = spawn("ffmpeg", [
    "-f", "dshow",
    "-i", `audio="${microfone}"`,
    "-ar", "16000",
    "-ac", "1",
    "-f", "s16le",
    "-"
  ], {
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });

  let audioCount = 0;
  let lastResult = "";

  ffmpeg.on("error", (err) => {
    console.error("❌ FFmpeg erro:", err.message);
    console.error("⚠️  Tentando microfone alternativo...");
    process.exit(1);
  });

  ffmpeg.stderr.on("data", (data) => {
    // Ignorar logs do FFmpeg
  });

  // Processar áudio
  ffmpeg.stdout.on("data", (chunk) => {
    audioCount++;
    
    // Log a cada 10 chunks
    if (audioCount % 10 === 0) {
      process.stdout.write(".");
    }

    try {
      if (recognizer.acceptWaveform(chunk)) {
        // Resultado final
        const result = JSON.parse(recognizer.result());
        
        if (result.result && result.result.length > 0) {
          // Texto com confidência
          const text = result.result.map(r => r.conf ? `${r.conf.toFixed(2)}:${r.text}` : r.text).join(" ");
          console.log(`\n🧠 Reconhecido: "${text}"`);
          
          if (result.text && result.text !== lastResult) {
            lastResult = result.text;
            handleSpeech(result.text);
          }
        }
      } else {
        // Resultado parcial
        const partial = JSON.parse(recognizer.getPartialResult());
        if (partial.partial && partial.partial.length > 0) {
          // Mostrar reconhecimento parcial a cada 3 segundos
          if (audioCount % 48 === 0) {
            process.stdout.write("\n");
          }
        }
      }
    } catch (e) {
      console.error("\n❌ Erro ao processar Vosk:", e.message);
    }
  });

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n\n✅ Ultron encerrado.");
    try {
      recognizer.free();
      ffmpeg.kill();
    } catch (e) {}
    process.exit(0);
  });

  // Timeout para verificar se está funcionando
  setTimeout(() => {
    if (audioCount === 0) {
      console.error("\n❌ Nenhum áudio detectado. Verifique o microfone!");
      console.error("Microfones disponíveis:");
      MICROPHONES.forEach((m, i) => {
        console.error(`  ${i + 1}. ${m}`);
      });
      process.exit(1);
    }
  }, 5000);
}

// ================= INICIAR =================
iniciarStream();
