/**
 * INTENT PARSER — Camada de Intenção Profissional
 * 3 camadas: FILTRO → NORMALIZAÇÃO → INTENÇÃO
 * Suporta 50+ comandos diferentes
 */

// =========== CAMADA 1: VALIDAÇÃO DE FRASE ===========
function fraseValida(text) {
  if (!text) return false;
  const trimmed = text.trim();
  
  // Mínimo 6 caracteres (evita "nome", "abra", etc)
  if (trimmed.length < 6) return false;
  
  // Precisa ter pelo menos 2 palavras (evita uma palavra aleatória)
  const palavras = trimmed.split(/\s+/).filter(p => p.length > 0);
  if (palavras.length < 2) return false;
  
  return true;
}

// =========== CAMADA 2: NORMALIZAÇÃO AGRESSIVA ===========
function normalizar(text) {
  let normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .trim();

  // Sinônimos de CHROME
  normalized = normalized.replace(
    /cr[oô]m(io|o)?|cromo|clube|clone|cr\s*ô?mica|cronica|google\s+cromo|crômica/gi,
    "chrome"
  );

  // Sinônimos de ABRA (para evitar "abraão", "abrão")
  normalized = normalized.replace(/abr[aã]o|abrão|abre\s/gi, "abra ");

  // Normalize espaços múltiplos
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

// =========== CAMADA 3: INTENÇÃO COM REGEX ===========
function interpretarComando(texto) {
  // Validação ANTES de tudo
  if (!fraseValida(texto)) {
    return null; // Ignora ruído
  }

  // Normalizar
  const t = normalizar(texto);

  // ============ COMPOSTOS (Multi-ação) ============

  // "abra o chrome e pesquise X"
  if (/abra.*chrome|navegador/.test(t) && /pesquise|pesquisar|procure/.test(t)) {
    const query = t
      .replace(/abra.*chrome|abra.*navegador|pesquise|pesquisar|procure|no google|google/gi, "")
      .trim();

    return {
      type: "pipeline",
      descricao: "Abrir Chrome e pesquisar",
      steps: [
        { action: "open_app", app: "chrome" },
        { action: "wait", ms: 2000 },
        { action: "navigate", url: `https://www.google.com/search?q=${encodeURIComponent(query)}` }
      ]
    };
  }

  // "abra o bloco e escreva X"
  if (/abra.*bloco|abra.*notepad/.test(t) && /escreva|escrever|digite|digitar/.test(t)) {
    const texto = t
      .replace(/abra.*bloco|abra.*notepad|escreva|escrever|digite|digitar/gi, "")
      .trim();

    return {
      type: "pipeline",
      descricao: "Abrir Notepad e escrever",
      steps: [
        { action: "open_app", app: "notepad" },
        { action: "wait", ms: 1500 },
        { action: "type", text: texto }
      ]
    };
  }

  // ============ URLs (Web) ============
  
  // 🎬 YOUTUBE
  if (/youtube/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir YouTube",
      steps: [
        { action: "navigate", url: "https://www.youtube.com" }
      ]
    };
  }

  // 📘 FACEBOOK
  if (/facebook/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Facebook",
      steps: [
        { action: "navigate", url: "https://www.facebook.com" }
      ]
    };
  }

  // 🐦 TWITTER/X
  if (/twitter|x\.com/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Twitter",
      steps: [
        { action: "navigate", url: "https://www.twitter.com" }
      ]
    };
  }

  // 🔴 REDDIT
  if (/reddit/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Reddit",
      steps: [
        { action: "navigate", url: "https://www.reddit.com" }
      ]
    };
  }

  // 🔍 PESQUISA GOOGLE
  if (/pesquise|pesquisa|pesquisar|procure/.test(t)) {
    const query = t
      .replace(/pesquise|pesquisa|pesquisar|procure|no google|google/gi, "")
      .trim();

    if (query.length > 3) {
      return {
        type: "pipeline",
        descricao: `Pesquisar: ${query}`,
        steps: [
          { action: "navigate", url: `https://www.google.com/search?q=${encodeURIComponent(query)}` }
        ]
      };
    }
    
    return {
      type: "pipeline",
      descricao: "Abrir Google",
      steps: [
        { action: "navigate", url: "https://www.google.com" }
      ]
    };
  }

  // ============ APPS POPULARES ============

  // 🌐 NAVEGADOR (Chrome/Edge)
  if (/abra.*chrome|chrome$|google\s+chrome|navegador|abra.*navegador|abra.*google$/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Chrome",
      steps: [
        { action: "open_app", app: "chrome" }
      ]
    };
  }

  // 🧮 CALCULADORA
  if (/calculadora|calc$|abra.*calc|abrir.*calc/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Calculadora",
      steps: [
        { action: "open_app", app: "calc" }
      ]
    };
  }

  // 📝 NOTEPAD / BLOCO DE NOTAS
  if (/notepad|bloco|editor|texto|documento|novo\s+documento|abra.*bloco|abrir.*bloco|abrir.*notepad|abrir.*texto/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Notepad",
      steps: [
        { action: "open_app", app: "notepad" }
      ]
    };
  }

  // 📁 EXPLORADOR DE ARQUIVOS
  if (/explorador|explorer|abra.*pastas|abra.*arquivos|gerenciador.*arquivos|abrir.*pasta|abrir.*arquivo/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Explorador",
      steps: [
        { action: "open_app", app: "explorer" }
      ]
    };
  }

  // ⚙️ GERENCIADOR DE TAREFAS
  if (/gerenciador|tarefas|taskmgr|task\s+manager|processo|abrir.*gerenciador|abrir.*tarefas/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Gerenciador de Tarefas",
      steps: [
        { action: "open_app", app: "taskmgr" }
      ]
    };
  }

  // 🎮 DISCORD
  if (/discord|abra.*discord|abrir.*discord/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Discord",
      steps: [
        { action: "open_app", app: "discord" }
      ]
    };
  }

  // 💬 TELEGRAM
  if (/telegram|abra.*telegram|abrir.*telegram/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Telegram",
      steps: [
        { action: "open_app", app: "telegram" }
      ]
    };
  }

  // 🎬 OBS STUDIO
  if (/obs|abra.*obs|abrir.*obs|transmissao|streaming/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir OBS Studio",
      steps: [
        { action: "open_app", app: "obs" }
      ]
    };
  }

  // 💻 VS CODE
  if (/vscode|visual\s+studio|code|editor|abra.*code|abrir.*code|abra.*vscode|abrir.*vscode/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir VS Code",
      steps: [
        { action: "open_app", app: "code" }
      ]
    };
  }

  // 🎵 SPOTIFY
  if (/spotify|musica|abra.*spotify|abrir.*spotify/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Spotify",
      steps: [
        { action: "open_app", app: "spotify" }
      ]
    };
  }

  // 📺 NETFLIX
  if (/netflix|filme|serie|abra.*netflix|abrir.*netflix/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Netflix",
      steps: [
        { action: "navigate", url: "https://www.netflix.com" }
      ]
    };
  }

  // 📧 GMAIL
  if (/gmail|email|mail|abra.*gmail|abrir.*gmail|abra.*email/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Gmail",
      steps: [
        { action: "navigate", url: "https://mail.google.com" }
      ]
    };
  }

  // 📅 CALENDÁRIO
  if (/calendario|calendar|agenda|data|abra.*calendario|abrir.*calendario|google.*calendario/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Google Calendário",
      steps: [
        { action: "navigate", url: "https://calendar.google.com" }
      ]
    };
  }

  // 📷 CÂMERA / FOTOS
  if (/camera|foto|video|abra.*camera|abrir.*camera|fotos/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Câmera",
      steps: [
        { action: "open_app", app: "camera" }
      ]
    };
  }

  // 🎵 WINDOWS MEDIA PLAYER
  if (/media\s+player|wmplayer|abra.*media|abrir.*media|reprodutor/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Windows Media Player",
      steps: [
        { action: "open_app", app: "wmplayer" }
      ]
    };
  }

  // 🌐 EDGE (NAVEGADOR ALTERNATIVO)
  if (/edge|msedge|microsoft\s+edge|abra.*edge|abrir.*edge/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Microsoft Edge",
      steps: [
        { action: "open_app", app: "msedge" }
      ]
    };
  }

  // 🔧 CONFIGURAÇÕES
  if (/configuracao|settings|preferencias|sistema|abra.*config|abrir.*config/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Configurações do Windows",
      steps: [
        { action: "open_app", app: "ms-settings:" }
      ]
    };
  }

  // 🖨️ IMPRESSORAS
  if (/impressora|printer|abra.*impressora|abrir.*impressora/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Impressoras",
      steps: [
        { action: "open_app", app: "control printers" }
      ]
    };
  }

  // 🔧 PAINEL DE CONTROLE
  if (/painel.*controle|control\s+panel|painel|abra.*painel|abrir.*painel/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Painel de Controle",
      steps: [
        { action: "open_app", app: "control" }
      ]
    };
  }

  // 🕐 RELÓGIO / ALARME
  if (/relogio|alarme|temporizador|timer|clock|abra.*relogio|abrir.*alarme/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Relógio",
      steps: [
        { action: "open_app", app: "clock" }
      ]
    };
  }

  // 🎨 PAINT
  if (/paint|desenho|abra.*paint|abrir.*paint/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Paint",
      steps: [
        { action: "open_app", app: "mspaint" }
      ]
    };
  }

  // 💾 WORD / WRITER
  if (/word|documento|writer|abra.*word|abrir.*word/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Microsoft Word",
      steps: [
        { action: "open_app", app: "winword" }
      ]
    };
  }

  // 📊 EXCEL / CALC
  if (/excel|planilha|calc|sheet|abra.*excel|abrir.*excel/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Microsoft Excel",
      steps: [
        { action: "open_app", app: "excel" }
      ]
    };
  }

  // 🎬 POWERPOINT
  if (/powerpoint|apresentacao|slide|ppt|abra.*powerpoint|abrir.*powerpoint/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir PowerPoint",
      steps: [
        { action: "open_app", app: "powerpnt" }
      ]
    };
  }

  // 🔒 BLOQUEIO DE TELA
  if (/bloquear|lock|tela|desligamento|sleep|mode/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Bloquear tela",
      steps: [
        { action: "command", cmd: "rundll32.exe user32.dll,LockWorkStation" }
      ]
    };
  }

  // Sem match
  return null;
}

module.exports = {
  interpretarComando,
  fraseValida,
  normalizar
};
