const readline = require("readline");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const vosk = require("vosk");
const { containsHotword, stripHotword } = require("./app/voice/hotword_listener");
const { matchIntent } = require("./app/voice/intent_router");
const commandExecutor = require("./app/voice/command_executor_generic");

// ================= CONFIG =================
const MICROFONE = "Microfone (2- High Definition Audio Device)";
const MODEL_PATH = "./vosk-model";
const WAV_PATH = path.join(__dirname, "input.wav");
const RECORD_SECONDS = 8;

// ================= VOSK SETUP =================
if (!fs.existsSync(MODEL_PATH)) {
  console.error("❌ Modelo Vosk não encontrado em:", MODEL_PATH);
  console.error("Baixe com: curl -L -o vosk-model-pt-br.zip https://alphacephei.com/vosk/models/vosk-model-small-pt-0.3.zip");
  process.exit(1);
}

vosk.setLogLevel(0);
const model = new vosk.Model(MODEL_PATH);
console.log("✅ Modelo Vosk carregado: vosk-model\n");

// ================= READLINE =================
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ================= BANNER =================
console.clear();
console.log(`
╔════════════════════════════════════════════════════════╗
║ 🎤 ULTRON - VOZ COM FFMPEG + VOSK                     ║
║ Modelo PT-BR carregado ✅                             ║
╚════════════════════════════════════════════════════════╝
`);

// ================= FUNÇÕES =================
function gravarAudio() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(WAV_PATH)) fs.unlinkSync(WAV_PATH);

    console.log(`🎤 Gravando por ${RECORD_SECONDS} segundos...`);

    const ffmpeg = spawn("ffmpeg", [
      "-y", "-f", "dshow",
      "-i", `audio=${MICROFONE}`,
      "-t", String(RECORD_SECONDS),
      "-ac", "1",
      "-ar", "16000",
      WAV_PATH
    ], { stdio: ["pipe", "pipe", "pipe"] });

    const timeout = setTimeout(() => ffmpeg.kill(), (RECORD_SECONDS + 2) * 1000);

    ffmpeg.on("close", () => {
      clearTimeout(timeout);
      if (fs.existsSync(WAV_PATH) && fs.statSync(WAV_PATH).size > 1000) {
        resolve();
      } else {
        reject(new Error("Falha na gravação"));
      }
    });
  });
}

function transcrever() {
  try {
    const buffer = fs.readFileSync(WAV_PATH);
    const rec = new vosk.Recognizer({ model, sampleRate: 16000 });
    rec.acceptWaveform(buffer);
    const result = rec.finalResult();
    rec.free();
    return result.text || "";
  } catch (e) {
    throw new Error("Erro na transcrição: " + e.message);
  }
}

// ================= LOOP =================
function prompt() {
  rl.question("\n[ENTER=GRAVAR | Digite | 'sair'] => ", async (input) => {

    // SAIR
    if (input.trim().toLowerCase() === "sair") {
      console.log("✅ Até logo!");
      rl.close();
      process.exit(0);
    }

    // ENTER → VOZ
    if (input.trim() === "") {
      try {
        await gravarAudio();
        console.log("🧠 Transcrevendo...");
        const texto = transcrever();

        if (!texto || texto.trim() === "") {
          console.log("⚠️  Sem transcrição detectada");
          return prompt();
        }

        console.log(`📝 Transcrição: "${texto}"`);

        if (!containsHotword(texto)) {
          console.log("🔇 Hotword não detectada. Diga 'Ultron' para ativar.");
          return prompt();
        }

        const command = stripHotword(texto);

        if (!command) {
          console.log("⚠️  Nenhum comando após hotword.");
          return prompt();
        }

        console.log(`🎯 COMANDO ATIVADO: "${command}"`);
        
        // Intent Router — detecta intenção
        const intentResult = matchIntent(command);

        console.log("🧠 INTENT DETECTADA:");
        console.log(intentResult);

        // Executar comando
        console.log(`\n⚙️  EXECUTANDO: "${command}"\n`);
        const execResult = commandExecutor.executeCommand(command);

        if (execResult.success) {
          console.log(`✅ ${execResult.output}\n`);
        } else {
          console.log(`❌ ${execResult.output}\n`);
        }
        
      } catch (e) {
        console.log("❌ Erro:", e.message);
      }

      return prompt();
    }

    // TEXTO DIGITADO
    console.log(`✅ Comando digitado: "${input}"`);
    prompt();
  });
}

// ================= START =================
prompt();
