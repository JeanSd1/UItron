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

    // Mapa EXPANDIDO de comandos - COM VARIAÇÕES DE ARTIGOS E CASOS ESPECIAIS
    const COMMANDS = {
      // ===== APLICAÇÕES COMUNS =====
      // Chrome
      "abra o chrome": () => this.safeSpawn("chrome", [], "Chrome"),
      "abra chrome": () => this.safeSpawn("chrome", [], "Chrome"),
      "abra o google chrome": () => this.safeSpawn("chrome", [], "Chrome"),
      "abra google chrome": () => this.safeSpawn("chrome", [], "Chrome"),
      
      // Firefox
      "abra o firefox": () => this.safeSpawn("firefox", [], "Firefox"),
      "abra firefox": () => this.safeSpawn("firefox", [], "Firefox"),
      
      // Edge
      "abra o edge": () => this.safeSpawn("msedge", [], "Edge"),
      "abra edge": () => this.safeSpawn("msedge", [], "Edge"),
      "abra o microsoft edge": () => this.safeSpawn("msedge", [], "Edge"),
      
      // Notepad
      "abra o notepad": () => this.safeSpawn("notepad", [], "Notepad"),
      "abra notepad": () => this.safeSpawn("notepad", [], "Notepad"),
      "abra o bloco de notas": () => this.safeSpawn("notepad", [], "Notepad"),
      "abra bloco de notas": () => this.safeSpawn("notepad", [], "Notepad"),
      "abra novo documento de texto": () => this.safeSpawn("notepad", [], "Notepad"),
      
      // Calculadora
      "abra a calculadora": () => this.safeSpawn("calc", [], "Calculadora"),
      "abra calculadora": () => this.safeSpawn("calc", [], "Calculadora"),
      "abra calc": () => this.safeSpawn("calc", [], "Calculadora"),
      "abra o calc": () => this.safeSpawn("calc", [], "Calculadora"),
      
      // CMD/Terminal
      "abra o cmd": () => this.safeSpawn("cmd.exe", [], "CMD"),
      "abra cmd": () => this.safeSpawn("cmd.exe", [], "CMD"),
      "abra o terminal": () => this.safeSpawn("cmd.exe", [], "Terminal"),
      "abra terminal": () => this.safeSpawn("cmd.exe", [], "Terminal"),
      "abra o prompt": () => this.safeSpawn("cmd.exe", [], "CMD"),
      "abra prompt": () => this.safeSpawn("cmd.exe", [], "CMD"),
      
      // Explorer/Arquivos
      "abra o explorador": () => this.safeSpawn("explorer.exe", [], "Explorador"),
      "abra explorador": () => this.safeSpawn("explorer.exe", [], "Explorador"),
      "abra o arquivo": () => this.safeSpawn("explorer.exe", [], "Arquivos"),
      "abra arquivo": () => this.safeSpawn("explorer.exe", [], "Arquivos"),
      "abra os arquivos": () => this.safeSpawn("explorer.exe", [], "Arquivos"),
      "abra arquivos": () => this.safeSpawn("explorer.exe", [], "Arquivos"),
      
      // Office
      "abra o word": () => this.safeSpawn("winword", [], "Word"),
      "abra word": () => this.safeSpawn("winword", [], "Word"),
      "abra microsoft word": () => this.safeSpawn("winword", [], "Word"),
      "abra o microsoft word": () => this.safeSpawn("winword", [], "Word"),
      
      "abra o excel": () => this.safeSpawn("excel", [], "Excel"),
      "abra excel": () => this.safeSpawn("excel", [], "Excel"),
      "abra microsoft excel": () => this.safeSpawn("excel", [], "Excel"),
      "abra o microsoft excel": () => this.safeSpawn("excel", [], "Excel"),
      
      "abra o powerpoint": () => this.safeSpawn("powerpnt", [], "PowerPoint"),
      "abra powerpoint": () => this.safeSpawn("powerpnt", [], "PowerPoint"),
      "abra microsoft powerpoint": () => this.safeSpawn("powerpnt", [], "PowerPoint"),
      
      // Outros programas
      "abra o paint": () => this.safeSpawn("mspaint", [], "Paint"),
      "abra paint": () => this.safeSpawn("mspaint", [], "Paint"),
      
      "abra o vlc": () => this.safeSpawn("vlc", [], "VLC"),
      "abra vlc": () => this.safeSpawn("vlc", [], "VLC"),
      
      "abra o anydesk": () => this.safeSpawn("anydesk", [], "AnyDesk"),
      "abra anydesk": () => this.safeSpawn("anydesk", [], "AnyDesk"),
      
      "abra o teamviewer": () => this.safeSpawn("teamviewer", [], "TeamViewer"),
      "abra teamviewer": () => this.safeSpawn("teamviewer", [], "TeamViewer"),
      
      "abra o bluestacks": () => this.safeSpawn("bluestacks", [], "BlueStacks"),
      "abra bluestacks": () => this.safeSpawn("bluestacks", [], "BlueStacks"),
      
      "abra o vscode": () => this.safeSpawn("code", [], "VS Code"),
      "abra vscode": () => this.safeSpawn("code", [], "VS Code"),
      "abra code": () => this.safeSpawn("code", [], "VS Code"),
      
      "abra o discord": () => this.safeSpawn("discord", [], "Discord"),
      "abra discord": () => this.safeSpawn("discord", [], "Discord"),
      
      "abra o obs": () => this.safeSpawn("obs", [], "OBS"),
      "abra obs": () => this.safeSpawn("obs", [], "OBS"),
      
      // ===== INFORMAÇÃO DO SISTEMA =====
      "qual e a hora": () => this.obterHora(),
      "qual é a hora": () => this.obterHora(),
      "que horas sao": () => this.obterHora(),
      "que horas são": () => this.obterHora(),
      "me diga a hora": () => this.obterHora(),
      "me diz a hora": () => this.obterHora(),
      
      "qual e a data": () => this.obterData(),
      "qual é a data": () => this.obterData(),
      "qual a data": () => this.obterData(),
      "qual e a data de hoje": () => this.obterData(),
      
      "status do sistema": () => this.statusSistema(),
      "como esta o sistema": () => this.statusSistema(),
      "como está o sistema": () => this.statusSistema(),
      "sistema": () => this.statusSistema(),
      
      "listar arquivos": () => this.listarArquivos(),
      "listar": () => this.listarArquivos(),
      "liste os arquivos": () => this.listarArquivos(),
      "quais arquivos": () => this.listarArquivos(),
    };

    // Executar comando encontrado - DOIS MODOS:
    // 1. Match exato (prioritário)
    // 2. Match parcial (flexível)
    
    // MODO 1: Procura exata
    for (const [pattern, func] of Object.entries(COMMANDS)) {
      if (text === pattern) {
        const resultado = await func();
        return { sucesso: true, msg: `✅ Executado: ${pattern}` };
      }
    }

    // MODO 2: Procura parcial (contém)
    for (const [pattern, func] of Object.entries(COMMANDS)) {
      if (text.includes(pattern)) {
        const resultado = await func();
        return { sucesso: true, msg: `✅ Executado: ${pattern}` };
      }
    }

    // MODO 3: Procura por palavras-chave (muito flexível)
    const KEYWORDS = {
      "chrome|google": () => this.safeSpawn("chrome", [], "Chrome"),
      "firefox": () => this.safeSpawn("firefox", [], "Firefox"),
      "edge|microsoft edge": () => this.safeSpawn("msedge", [], "Edge"),
      "notepad|bloco|texto|documento": () => this.safeSpawn("notepad", [], "Notepad"),
      "calc|calculadora": () => this.safeSpawn("calc", [], "Calculadora"),
      "cmd|terminal|prompt": () => this.safeSpawn("cmd.exe", [], "CMD"),
      "explorer|arquivo|pasta": () => this.safeSpawn("explorer.exe", [], "Explorador"),
      "word|documento": () => this.safeSpawn("winword", [], "Word"),
      "excel|planilha": () => this.safeSpawn("excel", [], "Excel"),
      "powerpoint|apresentacao": () => this.safeSpawn("powerpnt", [], "PowerPoint"),
      "paint|desenho": () => this.safeSpawn("mspaint", [], "Paint"),
      "vlc|video|musica": () => this.safeSpawn("vlc", [], "VLC"),
      "anydesk|remoto": () => this.safeSpawn("anydesk", [], "AnyDesk"),
      "teamviewer": () => this.safeSpawn("teamviewer", [], "TeamViewer"),
      "bluestacks|android|emulador": () => this.safeSpawn("bluestacks", [], "BlueStacks"),
      "vscode|code|programacao": () => this.safeSpawn("code", [], "VS Code"),
      "discord|chat": () => this.safeSpawn("discord", [], "Discord"),
      "obs|transmissao|live": () => this.safeSpawn("obs", [], "OBS"),
      "hora|horas|tempo": () => this.obterHora(),
      "data|hoje|calendario": () => this.obterData(),
      "sistema|status|saude|memoria": () => this.statusSistema(),
      "lista|arquivos|pasta|files": () => this.listarArquivos(),
    };

    // Procura por palavras-chave
    for (const [keywords, func] of Object.entries(KEYWORDS)) {
      const keywordList = keywords.split("|");
      if (keywordList.some(kw => text.includes(kw))) {
        const resultado = await func();
        return { sucesso: true, msg: `✅ Executado: ${keywords}` };
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
