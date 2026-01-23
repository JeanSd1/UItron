/**
 * EXECUTOR GENÉRICO — Baixo nível
 * Executa qualquer ação: app, teclado, mouse, escrita, delay
 * Sem travamento, sem await desnecessário
 */

const { spawn, execSync } = require("child_process");
const ks = require("node-key-sender");

class ExecutorGenerico {
  constructor() {
    this.appProcesses = {};
    this.lastAction = null;
  }

  /**
   * Abre um aplicativo
   * @param {string} app - nome do app (chrome, calc, notepad, etc)
   * @returns {Promise<boolean>}
   */
  async openApp(app) {
    const appName = this._normalizeAppName(app);
    
    return new Promise((resolve) => {
      try {
        const child = spawn("cmd", ["/c", "start", "", appName], {
          detached: true,
          stdio: "ignore",
          windowsHide: true
        });

        this.appProcesses[appName] = child;

        child.on("error", (err) => {
          console.error(`[EXEC ERROR] Não consegui abrir ${app}:`, err.message);
          resolve(false);
        });

        child.unref();

        // Aguarda um pouco para o app abrir
        setTimeout(() => {
          resolve(true);
        }, 1000);

      } catch (err) {
        console.error(`[FATAL] Erro ao abrir ${app}:`, err.message);
        resolve(false);
      }
    });
  }

  /**
   * Fecha um aplicativo
   * @param {string} app - nome do app
   * @returns {Promise<boolean>}
   */
  async closeApp(app) {
    const appName = this._normalizeAppName(app);
    
    return new Promise((resolve) => {
      try {
        // Tenta fechar via taskkill (Windows)
        spawn("cmd", ["/c", `taskkill /IM ${appName}.exe /F`], {
          detached: true,
          stdio: "ignore",
          windowsHide: true
        }).unref();

        setTimeout(() => {
          resolve(true);
        }, 500);

      } catch (err) {
        resolve(false);
      }
    });
  }

  /**
   * Digita texto
   * @param {string} text - texto a digitar
   * @param {number} delay - delay entre caracteres (ms)
   * @returns {Promise<boolean>}
   */
  async type(text, delay = 30) {
    return new Promise((resolve) => {
      try {
        ks.sendText(text);
        
        setTimeout(() => {
          resolve(true);
        }, text.length * delay);

      } catch (err) {
        console.error(`[TYPE ERROR]:`, err.message);
        resolve(false);
      }
    });
  }

  /**
   * Pressiona uma tecla
   * @param {string} key - tecla (enter, space, tab, etc)
   * @returns {Promise<boolean>}
   */
  async pressKey(key) {
    return new Promise((resolve) => {
      try {
        const keyMap = {
          "enter": "Return",
          "space": "Space",
          "tab": "Tab",
          "escape": "Escape",
          "backspace": "BackSpace",
          "delete": "Delete",
          "up": "Up",
          "down": "Down",
          "left": "Left",
          "right": "Right",
          "home": "Home",
          "end": "End"
        };

        const mappedKey = keyMap[key.toLowerCase()] || key.toLowerCase();
        ks.sendKey([mappedKey]);

        setTimeout(() => {
          resolve(true);
        }, 100);

      } catch (err) {
        console.error(`[KEY ERROR]:`, err.message);
        resolve(false);
      }
    });
  }

  /**
   * Aguarda X milissegundos
   * @param {number} ms - milissegundos
   * @returns {Promise<boolean>}
   */
  async wait(ms = 500) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, ms);
    });
  }

  /**
   * Executa um comando do sistema (cmd)
   * @param {string} command - comando a executar
   * @returns {Promise<boolean>}
   */
  async execCommand(command) {
    return new Promise((resolve) => {
      try {
        spawn("cmd", ["/c", command], {
          detached: true,
          stdio: "ignore",
          windowsHide: true
        }).unref();

        setTimeout(() => {
          resolve(true);
        }, 500);

      } catch (err) {
        console.error(`[CMD ERROR]:`, err.message);
        resolve(false);
      }
    });
  }

  /**
   * Escreve na URL do navegador e navega
   * @param {string} url - URL
   * @returns {Promise<boolean>}
   */
  async navigate(url) {
    return new Promise(async (resolve) => {
      try {
        // Abre em navegador padrão
        await this.execCommand(`start ${url}`);
        
        setTimeout(() => {
          resolve(true);
        }, 2000);

      } catch (err) {
        console.error(`[NAVIGATE ERROR]:`, err.message);
        resolve(false);
      }
    });
  }

  /**
   * Normaliza nome de app para executável
   * @private
   */
  _normalizeAppName(app) {
    const map = {
      "chrome": "chrome",
      "navegador": "chrome",
      "firefox": "firefox",
      "edge": "msedge",
      "calc": "calc",
      "calculadora": "calc",
      "notepad": "notepad",
      "bloco": "notepad",
      "explorer": "explorer",
      "pasta": "explorer",
      "discord": "discord",
      "telegram": "telegram",
      "spotify": "spotify",
      "obs": "obs",
      "code": "code",
      "vscode": "code"
    };

    return map[app.toLowerCase()] || app;
  }

  /**
   * Executa um pipeline inteiro (sequência de ações)
   * @param {Array} steps - array de { action, ... }
   * @returns {Promise<Object>}
   */
  async executePipeline(steps) {
    const resultados = [];

    for (const step of steps) {
      const { action, ...params } = step;

      let resultado = false;

      try {
        switch (action) {
          case "open_app":
            resultado = await this.openApp(params.app);
            console.log(`  ➡️  Abrir ${params.app}: ${resultado ? "✅" : "❌"}`);
            break;

          case "close_app":
            resultado = await this.closeApp(params.app);
            console.log(`  ➡️  Fechar ${params.app}: ${resultado ? "✅" : "❌"}`);
            break;

          case "type":
            resultado = await this.type(params.text, params.delay);
            console.log(`  ➡️  Digitar: ${resultado ? "✅" : "❌"}`);
            break;

          case "key":
            resultado = await this.pressKey(params.key);
            console.log(`  ➡️  Tecla ${params.key}: ${resultado ? "✅" : "❌"}`);
            break;

          case "wait":
            resultado = await this.wait(params.ms || 500);
            console.log(`  ➡️  Aguardar ${params.ms}ms: ${resultado ? "✅" : "❌"}`);
            break;

          case "navigate":
            resultado = await this.navigate(params.url);
            console.log(`  ➡️  Navegar para ${params.url}: ${resultado ? "✅" : "❌"}`);
            break;

          case "command":
            resultado = await this.execCommand(params.cmd);
            console.log(`  ➡️  Executar comando: ${resultado ? "✅" : "❌"}`);
            break;

          default:
            console.log(`  ⚠️  Ação desconhecida: ${action}`);
        }
      } catch (err) {
        console.error(`  ❌ Erro na ação ${action}:`, err.message);
      }

      resultados.push({ action, resultado });

      // Small delay entre steps para não sobrecarregar
      if (steps.indexOf(step) < steps.length - 1) {
        await this.wait(200);
      }
    }

    return {
      sucesso: resultados.every(r => r.resultado),
      totalSteps: steps.length,
      completedSteps: resultados.filter(r => r.resultado).length,
      detalhes: resultados
    };
  }
}

module.exports = new ExecutorGenerico();
