/**
 * Command Executor — ULTRON UNIVERSAL
 * Executa QUALQUER comando genérico
 * Suporta: arquivos, sistema, PowerShell, aplicações
 */

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

class CommandExecutor {
  constructor() {
    this.commandHistory = [];
    this.maxHistory = 100;
    this.commonPaths = [
      "C:\\Program Files",
      "C:\\Program Files (x86)",
      path.join(process.env.APPDATA, "..\\Local\\Programs"),
      "C:\\Windows\\System32"
    ];
  }

  /**
   * Executar comando genérico
   */
  executeCommand(command) {
    this.logCommand(command);

    try {
      // 1. Padrões específicos
      if (this._matchPattern(command, ["listar", "ver", "mostrar", "arquivos", "pasta"])) {
        return this._executeListFiles(command);
      }

      if (this._matchPattern(command, ["hora", "horas", "que horas", "data"])) {
        return this._executeGetTime();
      }

      if (this._matchPattern(command, ["status", "sistema", "cpu", "memoria"])) {
        return this._executeSystemStatus();
      }

      if (this._matchPattern(command, ["fale", "diga", "me diga", "repita"])) {
        return this._executeSpeech(command);
      }

      // 2. Tentar abrir como app
      if (this._matchPattern(command, ["abra", "abre", "abrir", "iniciar", "open"])) {
        return this._executeOpenAppGeneric(command);
      }

      // 3. Fallback: comando genérico
      return this._executeSystemCommand(command);
    } catch (error) {
      return {
        success: false,
        output: `Erro: ${error.message.substring(0, 150)}`
      };
    }
  }

  /**
   * Abrir QUALQUER aplicação - versão universal
   */
  _executeOpenAppGeneric(command) {
    let appName = command
      .toLowerCase()
      .replace(/abra|abre|abrir|iniciar|open|o\s+/gi, "")
      .trim();

    // Mapa de aplicações conhecidas
    const appMap = {
      "chrome": ["chrome.exe", "google chrome"],
      "google chrome": ["chrome.exe"],
      "firefox": ["firefox.exe", "mozilla"],
      "edge": ["msedge.exe", "microsoft edge"],
      "internet explorer": ["iexplore.exe"],
      "word": ["winword.exe"],
      "excel": ["excel.exe"],
      "powerpoint": ["powerpnt.exe"],
      "outlook": ["outlook.exe"],
      "access": ["msaccess.exe"],
      "notepad": ["notepad.exe"],
      "bloco de notas": ["notepad.exe"],
      "calculadora": ["calc.exe"],
      "calc": ["calc.exe"],
      "cmd": ["cmd.exe"],
      "terminal": ["cmd.exe"],
      "powershell": ["powershell.exe"],
      "gerenciador de arquivos": ["explorer.exe"],
      "explorador": ["explorer.exe"],
      "arquivos": ["explorer.exe"],
      "vlc": ["vlc.exe"],
      "paint": ["mspaint.exe"],
      "pintura": ["mspaint.exe"],
      "taskmgr": ["taskmgr.exe"],
      "gerenciador de tarefa": ["taskmgr.exe"]
    };

    // 1. Tentar match no mapa
    for (const [pattern, exes] of Object.entries(appMap)) {
      if (appName.includes(pattern)) {
        for (const exe of exes) {
          try {
            const proc = spawn(exe, { detached: true, stdio: "ignore" });
            proc.unref();
            return { success: true, output: `✅ ${appName} aberto` };
          } catch (e) {
            continue;
          }
        }
      }
    }

    // 2. Procurar em caminhos comuns
    const possibleExes = [
      appName + ".exe",
      appName.split(" ")[0] + ".exe"
    ];

    for (const exe of possibleExes) {
      for (const basePath of this.commonPaths) {
        try {
          const result = this._findExecutable(basePath, exe);
          if (result) {
            const proc = spawn(result, { detached: true, stdio: "ignore" });
            proc.on("error", () => {});
            proc.unref();
            return { success: true, output: `✅ ${appName} aberto` };
          }
        } catch (e) {
          continue;
        }
      }
    }

    // 3. Tentar executar direto (se está no PATH)
    try {
      const proc = spawn(appName, { detached: true, stdio: "ignore" });
      proc.on("error", () => {});
      proc.unref();
      return { success: true, output: `✅ ${appName} aberto` };
    } catch (e) {
      // Continuar
    }

    // 4. Última tentativa: PowerShell Start-Process
    try {
      const psCommand = `Start-Process "${appName}" -WindowStyle Normal`;
      execSync(`powershell -NoProfile -Command "${psCommand}"`, {
        stdio: "pipe",
        timeout: 5000,
        windowsHide: true
      });
      return { success: true, output: `✅ ${appName} aberto (PowerShell)` };
    } catch (e) {
      // Falhou
    }

    return {
      success: false,
      output: `Não consegui encontrar '${appName}'. Tente: "abra chrome", "abra notepad", etc`
    };
  }

  /**
   * Procurar executável
   */
  _findExecutable(basePath, exeName) {
    try {
      if (!fs.existsSync(basePath)) return null;

      const items = fs.readdirSync(basePath);
      
      for (const item of items) {
        const fullPath = path.join(basePath, item);
        
        if (item.toLowerCase() === exeName.toLowerCase()) {
          return fullPath;
        }
        
        // Um nível para baixo
        try {
          const subItems = fs.readdirSync(fullPath).slice(0, 10);
          for (const subItem of subItems) {
            if (subItem.toLowerCase() === exeName.toLowerCase()) {
              return path.join(fullPath, subItem);
            }
          }
        } catch (e) {
          // Não é diretório
        }
      }
    } catch (e) {
      // Erro
    }
    
    return null;
  }

  /**
   * Listar arquivos
   */
  _executeListFiles(command) {
    try {
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
      const freeMemory = Math.round(os.freemem() / 1024 / 1024);
      const totalMemory = Math.round(os.totalmem() / 1024 / 1024);

      return {
        success: true,
        output: `Online por ${uptime}h | Memória: ${freeMemory}MB/${totalMemory}MB`
      };
    } catch (e) {
      return { success: false, output: `Erro ao verificar sistema` };
    }
  }

  /**
   * Falar por TTS
   */
  _executeSpeech(command) {
    let text = command
      .replace(/fale|diga|me diga|repita/gi, "")
      .trim();

    if (!text) {
      text = "Ultron ativado";
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
      return { success: false, output: `Erro ao falar` };
    }
  }

  /**
   * Comando genérico do sistema
   */
  _executeSystemCommand(command) {
    try {
      const result = execSync(`powershell -Command "${command}"`, {
        encoding: "utf-8",
        timeout: 5000,
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true
      });

      return {
        success: true,
        output: result.substring(0, 300)
      };
    } catch (e) {
      // Tentar como programa direto
      try {
        spawn(command, { detached: true, stdio: "ignore" }).unref();
        return {
          success: true,
          output: `✅ Executado: ${command}`
        };
      } catch (err) {
        return {
          success: false,
          output: `Comando não reconhecido. Tente: "abra chrome", "qual é a hora", etc`
        };
      }
    }
  }

  /**
   * Verificar padrão
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
   * Registrar comando
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
   * Histórico
   */
  getHistory() {
    return this.commandHistory;
  }
}

module.exports = new CommandExecutor();
