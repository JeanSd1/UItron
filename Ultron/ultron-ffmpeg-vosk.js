const readline = require("readline");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const vosk = require("vosk");
const { containsHotword, stripHotword } = require("./app/voice/hotword_listener");
const { matchIntent } = require("./app/voice/intent_router");
const executor = require("./app/voice/executor_robusto");

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
    if (!fs.existsSync(WAV_PATH)) {
      throw new Error("Arquivo WAV não encontrado");
    }

    const stats = fs.statSync(WAV_PATH);
    if (stats.size < 2000) {
      console.log("⚠️  Arquivo muito pequeno — microfone silencioso?");
      return "";
    }

    const buffer = fs.readFileSync(WAV_PATH);
    const rec = new vosk.Recognizer({ model, sampleRate: 16000 });
    
    rec.acceptWaveform(buffer);
    const result = rec.finalResult();
    rec.free();

    const text = result.text || result.result?.join("") || "";
    
    if (text && text.trim().length > 0) {
      return text.trim();
    }
    
    return "";
  } catch (e) {
    console.log("⚠️  Erro na transcrição:", e.message);
    return "";
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
          console.log("💡 Dica: Fale mais alto ou mais perto do microfone\n");
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
        
        // REGRA 2: Resposta ANTES da execução
        console.log(`\n✅ Executando: "${command}"\n`);
        
        // REGRA 3: Execução isolada com espera
        try {
          const resultado = await executor.executar(command);
          console.log(`${resultado.sucesso ? "✅" : "❌"} ${resultado.msg}\n`);
        } catch (e) {
          console.log(`⚠️  Erro: ${e.message}\n`);
        }
        
      } catch (e) {
        console.log("❌ Erro:", e.message);
      }

      return prompt();
    }

    // TEXTO DIGITADO
    console.log(`✅ Comando digitado: "${input}"`);
    
    // REGRA 2: Resposta ANTES da execução
    console.log(`⚙️  Processando...\n`);
    
    // REGRA 3: Execução isolada
    (async () => {
      try {
        const resultado = await executor.executar(input);
        console.log(`${resultado.sucesso ? "✅" : "❌"} ${resultado.msg}\n`);
      } catch (e) {
        console.log(`⚠️  Erro: ${e.message}\n`);
      }
      prompt();
    })();
  });
}

// ================= START =================
prompt();
