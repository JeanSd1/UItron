const vosk = require("vosk");
const fs = require("fs");

vosk.setLogLevel(0);

if (!fs.existsSync("./vosk-model")) {
  console.error("❌ Modelo não encontrado!");
  process.exit(1);
}

const model = new vosk.Model("./vosk-model");
console.log("✅ Modelo carregado com sucesso!");
process.exit(0);
