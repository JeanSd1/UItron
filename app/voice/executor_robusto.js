/**
 * EXECUTOR ROBUSTO — Isolado, sem crashes
 * REGRA: Spawn sempre com handlers, nunca unhandled rejections
 */

const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class ExecutorRobusto {
  constructor() {
    this.lastCommand = null;
    this.isExecuting = false;
  }

  /**
   * REGRA 1: Validação rigorosa
   * Nada entra no executor sem passar aqui
   */
  validar(comando) {
    if (!comando || typeof comando !== "string") return null;
    
    const texto = comando
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    
    return texto.length > 0 ? texto : null;
  }

  /**
   * REGRA 3: Spawn isolado com handlers
   * NO WINDOWS: sempre use cmd /c start
   */
  safeSpawn(exe, args = [], descricao = "") {
    return new Promise((resolve) => {
      try {
        // Windows: cmd /c start "" app.exe
        const child = spawn("cmd", ["/c", "start", "", exe], {
          detached: true,
          stdio: "ignore",
          windowsHide: true
        });

        // Handler IMEDIATO
        child.on("error", (err) => {
          console.error(`[SPAWN ERROR] ${descricao}: ${err.message}`);
          resolve(false);
        });

        child.once("exit", () => {
          console.log(`[SPAWN EXIT] ${descricao}`);
        });

        child.unref();
        resolve(true);

      } catch (err) {
        console.error(`[FATAL SPAWN] ${descricao}: ${err.message}`);
        resolve(false);
      }
    });
  }

  /**
   * Executor principal
   * Fluxo: validar → normalizar → mapear → executar
   */
  async executar(comando) {
    // REGRA 1: Validação
    const text = this.validar(comando);
    if (!text) {
      return { sucesso: false, msg: "Comando vazio" };
    }

    this.lastCommand = text;

    // Mapa SIMPLES de comandos - COM VARIAÇÕES DE ARTIGOS
    const COMMANDS = {
      // APPS — COM ARTIGOS (a, o, os)
      "abra o chrome": () => this.safeSpawn("chrome", [], "Chrome"),
      "abra o google chrome": () => this.safeSpawn("chrome", [], "Chrome"),
      "abra a calculadora": () => this.safeSpawn("calc", [], "Calculadora"),
      "abra o firefox": () => this.safeSpawn("firefox", [], "Firefox"),
      "abra o edge": () => this.safeSpawn("msedge", [], "Edge"),
      "abra o notepad": () => this.safeSpawn("notepad", [], "Notepad"),
      "abra o bloco de notas": () => this.safeSpawn("notepad", [], "Notepad"),
      "abra o cmd": () => this.safeSpawn("cmd.exe", [], "CMD"),
      "abra o terminal": () => this.safeSpawn("cmd.exe", [], "Terminal"),
      "abra o explorador": () => this.safeSpawn("explorer.exe", [], "Explorador"),
      "abra os arquivos": () => this.safeSpawn("explorer.exe", [], "Arquivos"),
      "abra o word": () => this.safeSpawn("winword", [], "Word"),
      "abra o excel": () => this.safeSpawn("excel", [], "Excel"),
      "abra o paint": () => this.safeSpawn("mspaint", [], "Paint"),
      "abra o vlc": () => this.safeSpawn("vlc", [], "VLC"),

      // APPS — SEM ARTIGOS (fallback)
      "abra chrome": () => this.safeSpawn("chrome", [], "Chrome"),
      "abra google chrome": () => this.safeSpawn("chrome", [], "Chrome"),
      "abra firefox": () => this.safeSpawn("firefox", [], "Firefox"),
      "abra edge": () => this.safeSpawn("msedge", [], "Edge"),
      "abra notepad": () => this.safeSpawn("notepad", [], "Notepad"),
      "abra bloco de notas": () => this.safeSpawn("notepad", [], "Notepad"),
      "abra calculadora": () => this.safeSpawn("calc", [], "Calculadora"),
      "abra calc": () => this.safeSpawn("calc", [], "Calculadora"),
      "abra cmd": () => this.safeSpawn("cmd.exe", [], "CMD"),
      "abra terminal": () => this.safeSpawn("cmd.exe", [], "Terminal"),
      "abra explorador": () => this.safeSpawn("explorer.exe", [], "Explorador"),
      "abra arquivos": () => this.safeSpawn("explorer.exe", [], "Arquivos"),
      "abra word": () => this.safeSpawn("winword", [], "Word"),
      "abra excel": () => this.safeSpawn("excel", [], "Excel"),
      "abra paint": () => this.safeSpawn("mspaint", [], "Paint"),
      "abra vlc": () => this.safeSpawn("vlc", [], "VLC"),

      // INFO
      "qual e a hora": () => this.obterHora(),
      "qual é a hora": () => this.obterHora(),
      "que horas sao": () => this.obterHora(),
      "que horas são": () => this.obterHora(),
      "qual e a data": () => this.obterData(),
      "qual é a data": () => this.obterData(),
      "status do sistema": () => this.statusSistema(),
      "listar arquivos": () => this.listarArquivos(),
    };

    // Executar comando encontrado
    for (const [pattern, func] of Object.entries(COMMANDS)) {
      if (text.includes(pattern)) {
        const resultado = await func();
        return { sucesso: true, msg: `✅ Executado: ${pattern}` };
      }
    }

    // Se não encontrou padrão
    return { sucesso: false, msg: `Comando não reconhecido: ${text}` };
  }

  /**
   * Auxiliares de informação
   */
  obterHora() {
    const now = new Date();
    const hora = now.toLocaleString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    console.log(`🕐 ${hora}`);
    return { sucesso: true, msg: `Hora: ${hora}` };
  }

  obterData() {
    const now = new Date();
    const data = now.toLocaleString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    console.log(`📅 ${data}`);
    return { sucesso: true, msg: `Data: ${data}` };
  }

  statusSistema() {
    try {
      const os = require("os");
      const uptime = Math.floor(os.uptime() / 3600);
      const memLivre = Math.round(os.freemem() / 1024 / 1024);
      const memTotal = Math.round(os.totalmem() / 1024 / 1024);
      const msg = `Online: ${uptime}h | Memória: ${memLivre}MB/${memTotal}MB`;
      console.log(`💻 ${msg}`);
      return { sucesso: true, msg: msg };
    } catch (e) {
      return { sucesso: false, msg: "Erro ao verificar sistema" };
    }
  }

  listarArquivos() {
    try {
      const dir = process.cwd();
      const arquivos = fs.readdirSync(dir).slice(0, 10).join(", ");
      console.log(`📁 ${arquivos}`);
      return { sucesso: true, msg: `Arquivos: ${arquivos}` };
    } catch (e) {
      return { sucesso: false, msg: "Erro ao listar" };
    }
  }
}

module.exports = new ExecutorRobusto();
