/**
 * Command Executor — ULTRON
 * Executa qualquer comando de voz com segurança
 * Suporta: arquivos, sistema, PowerShell
 */

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

class CommandExecutor {
  constructor() {
    this.commandHistory = [];
    this.maxHistory = 100;
  }

  /**
   * Executar comando genérico por voz
   */
  executeCommand(command) {
    this.logCommand(command);

    try {
      // Comandos de arquivo
      if (this._matchPattern(command, ["listar", "ver", "mostrar", "arquivos", "pasta"])) {
        return this._executeListFiles(command);
      }

      // Comandos de horário
      if (this._matchPattern(command, ["hora", "horas", "que horas", "data"])) {
        return this._executeGetTime();
      }

      // Comandos de sistema
      if (this._matchPattern(command, ["status", "sistema", "cpu", "memoria", "recurso"])) {
        return this._executeSystemStatus();
      }

      // Comandos de aplicações
      if (this._matchPattern(command, ["abra", "abre", "abrir", "iniciar"])) {
        return this._executeOpenApp(command);
      }

      // Comandos de voz/resposta
      if (this._matchPattern(command, ["fale", "diga", "me diga", "repita"])) {
        return this._executeSpeech(command);
      }

      // Fallback: tentar executar como comando do sistema
      return this._executeSystemCommand(command);
    } catch (error) {
      return {
        success: false,
        output: `Erro ao executar: ${error.message}`
      };
    }
  }

  /**
   * Listar arquivos
   */
  _executeListFiles(command) {
    try {
      // Detectar caminho se mencionado
      let dir = process.cwd();

      if (command.includes("desktop") || command.includes("área de trabalho")) {
        dir = path.join(process.env.USERPROFILE, "Desktop");
      } else if (command.includes("documentos")) {
        dir = path.join(process.env.USERPROFILE, "Documents");
      } else if (command.includes("downloads")) {
        dir = path.join(process.env.USERPROFILE, "Downloads");
      }

      if (!fs.existsSync(dir)) {
        return { success: false, output: `Diretório não encontrado: ${dir}` };
      }

      const files = fs.readdirSync(dir).slice(0, 20);
      const output = files.join("\n");

      return {
        success: true,
        output: `Arquivos em ${dir}:\n${output}`,
        data: files
      };
    } catch (e) {
      return { success: false, output: `Erro ao listar: ${e.message}` };
    }
  }

  /**
   * Obter hora/data
   */
  _executeGetTime() {
    const now = new Date();
    const timeStr = now.toLocaleString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    const dateStr = now.toLocaleString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    return {
      success: true,
      output: `${timeStr} - ${dateStr}`
    };
  }

  /**
   * Status do sistema
   */
  _executeSystemStatus() {
    try {
      const os = require("os");
      const uptime = Math.floor(os.uptime() / 3600);
      const platform = os.platform();
      const freeMemory = Math.round(os.freemem() / 1024 / 1024);
      const totalMemory = Math.round(os.totalmem() / 1024 / 1024);

      return {
        success: true,
        output: `Sistema online por ${uptime}h | Memória: ${freeMemory}MB/${totalMemory}MB disponível`
      };
    } catch (e) {
      return { success: false, output: `Erro ao verificar sistema: ${e.message}` };
    }
  }

  /**
   * Abrir aplicação
   */
  _executeOpenApp(command) {
    const appMap = {
      notepad: "notepad.exe",
      "bloco de notas": "notepad.exe",
      calculadora: "calc.exe",
      cmd: "cmd.exe",
      powershell: "powershell.exe",
      explorer: "explorer.exe",
      "gerenciador de arquivos": "explorer.exe",
      chrome: "chrome.exe",
      firefox: "firefox.exe",
      edge: "msedge.exe",
      word: "winword.exe",
      excel: "excel.exe"
    };

    for (const [appName, appExe] of Object.entries(appMap)) {
      if (command.toLowerCase().includes(appName)) {
        try {
          spawn(appExe, { detached: true });
          return { success: true, output: `✅ ${appName} aberto` };
        } catch (e) {
          return { success: false, output: `Erro ao abrir ${appName}: ${e.message}` };
        }
      }
    }

    return { success: false, output: "Aplicação não reconhecida" };
  }

  /**
   * Executar comando de voz (falar)
   */
  _executeSpeech(command) {
    let text = command
      .replace(/fale|diga|me diga|repita/gi, "")
      .trim();

    if (!text) {
      text = "Ultron ativado e pronto para comandos";
    }

    try {
      const psCommand = `Add-Type -AssemblyName System.Speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.Rate = 0; $speak.Volume = 100; $speak.Speak('${text.replace(/'/g, "''")}')`;
      execSync(`powershell -NoProfile -Command "${psCommand}"`, {
        stdio: "pipe",
        timeout: 15000
      });

      return {
        success: true,
        output: `✅ Falou: "${text}"`
      };
    } catch (e) {
      return { success: false, output: `Erro ao falar: ${e.message}` };
    }
  }

  /**
   * Executar comando do sistema genérico
   */
  _executeSystemCommand(command) {
    try {
      // Comando genérico PowerShell
      const result = execSync(`powershell -Command "${command}"`, {
        encoding: "utf-8",
        timeout: 30000,
        stdio: ["pipe", "pipe", "pipe"]
      });

      return {
        success: true,
        output: result.substring(0, 500)
      };
    } catch (e) {
      return {
        success: false,
        output: `Comando não executado: ${e.message.substring(0, 200)}`
      };
    }
  }

  /**
   * Verificar se comando contém padrões
   */
  _matchPattern(text, patterns) {
    const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    for (const pattern of patterns) {
      if (normalized.includes(pattern.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  /**
   * Registrar comando no histórico
   */
  logCommand(command) {
    this.commandHistory.push({
      timestamp: new Date(),
      command: command
    });

    if (this.commandHistory.length > this.maxHistory) {
      this.commandHistory.shift();
    }
  }

  /**
   * Obter histórico
   */
  getHistory() {
    return this.commandHistory;
  }
}

module.exports = new CommandExecutor();
