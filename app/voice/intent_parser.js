/**
 * INTENT PARSER — Camada de Intenção Profissional
 * 3 camadas: FILTRO → NORMALIZAÇÃO → INTENÇÃO
 * Sem ruído, sem spam, sem gambiarra
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

  // 🔍 PESQUISA GOOGLE (REGEX FORTE)
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

  // 🌐 NAVEGADOR (Chrome/Edge) — REGEX FORTE
  if (/abra.*chrome|chrome$|google\s+chrome|navegador|abra.*navegador/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Chrome",
      steps: [
        { action: "open_app", app: "chrome" }
      ]
    };
  }

  // 🧮 CALCULADORA
  if (/calculadora|abra.*calc|calc$/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Calculadora",
      steps: [
        { action: "open_app", app: "calc" }
      ]
    };
  }

  // 📝 NOTEPAD
  if (/notepad|bloco|editor|abra.*texto|abra.*bloco/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Notepad",
      steps: [
        { action: "open_app", app: "notepad" }
      ]
    };
  }

  // 📁 EXPLORADOR
  if (/explorador|explorer|abra.*pastas|abra.*arquivos/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Explorador",
      steps: [
        { action: "open_app", app: "explorer" }
      ]
    };
  }

  // 🎮 DISCORD
  if (/discord|abra.*discord/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Discord",
      steps: [
        { action: "open_app", app: "discord" }
      ]
    };
  }

  // 💬 TELEGRAM
  if (/telegram|abra.*telegram/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Telegram",
      steps: [
        { action: "open_app", app: "telegram" }
      ]
    };
  }

  // 🎬 OBS (Streaming)
  if (/obs|abra.*obs/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir OBS Studio",
      steps: [
        { action: "open_app", app: "obs" }
      ]
    };
  }

  // 💻 VSCODE
  if (/vscode|visual\s+studio|abra.*code/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir VS Code",
      steps: [
        { action: "open_app", app: "code" }
      ]
    };
  }

  // 🎵 SPOTIFY
  if (/spotify|abra.*spotify/.test(t)) {
    return {
      type: "pipeline",
      descricao: "Abrir Spotify",
      steps: [
        { action: "open_app", app: "spotify" }
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
