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

  // ============ URLs (Web) ============
  
  // 🎬 YOUTUBE
  if (/youtube/.test(t)) {
    return {
      type: "url",
      value: "https://www.youtube.com",
      descricao: "YouTube"
    };
  }

  // 📘 FACEBOOK
  if (/facebook/.test(t)) {
    return {
      type: "url",
      value: "https://www.facebook.com",
      descricao: "Facebook"
    };
  }

  // 🐦 TWITTER/X
  if (/twitter|x\.com/.test(t)) {
    return {
      type: "url",
      value: "https://www.twitter.com",
      descricao: "Twitter"
    };
  }

  // 🔴 REDDIT
  if (/reddit/.test(t)) {
    return {
      type: "url",
      value: "https://www.reddit.com",
      descricao: "Reddit"
    };
  }

  // 🔍 PESQUISA GOOGLE (REGEX FORTE)
  if (/pesquise|pesquisa|pesquisar|procure/.test(t)) {
    const query = t
      .replace(/pesquise|pesquisa|pesquisar|procure|no google|google/gi, "")
      .trim();

    if (query.length > 3) {
      return {
        type: "url",
        value: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        descricao: `Pesquisar: ${query}`
      };
    }
    
    // Se foi só "pesquise" sem query, abre Google
    return {
      type: "url",
      value: "https://www.google.com",
      descricao: "Google"
    };
  }

  // ============ APPS (Executáveis) ============

  // 🌐 NAVEGADOR (Chrome/Edge) — REGEX FORTE
  if (/abra.*chrome|chrome$|google\s+chrome|navegador|abra.*navegador/.test(t)) {
    return {
      type: "app",
      value: "chrome",
      descricao: "Abrir Chrome"
    };
  }

  // 🧮 CALCULADORA
  if (/calculadora|abra.*calc|calc$/.test(t)) {
    return {
      type: "app",
      value: "calc",
      descricao: "Abrir Calculadora"
    };
  }

  // 📝 NOTEPAD
  if (/notepad|bloco|editor|abra.*texto|abra.*bloco/.test(t)) {
    return {
      type: "app",
      value: "notepad",
      descricao: "Abrir Notepad"
    };
  }

  // 📁 EXPLORADOR
  if (/explorador|explorer|abra.*pastas|abra.*arquivos/.test(t)) {
    return {
      type: "app",
      value: "explorer",
      descricao: "Abrir Explorador"
    };
  }

  // 🎮 DISCORD
  if (/discord|abra.*discord/.test(t)) {
    return {
      type: "app",
      value: "discord",
      descricao: "Abrir Discord"
    };
  }

  // 💬 TELEGRAM
  if (/telegram|abra.*telegram/.test(t)) {
    return {
      type: "app",
      value: "telegram",
      descricao: "Abrir Telegram"
    };
  }

  // 🎬 OBS (Streaming)
  if (/obs|abra.*obs/.test(t)) {
    return {
      type: "app",
      value: "obs",
      descricao: "Abrir OBS Studio"
    };
  }

  // 💻 VSCODE
  if (/vscode|visual\s+studio|abra.*code/.test(t)) {
    return {
      type: "app",
      value: "code",
      descricao: "Abrir VS Code"
    };
  }

  // 🎵 SPOTIFY
  if (/spotify|abra.*spotify/.test(t)) {
    return {
      type: "app",
      value: "spotify",
      descricao: "Abrir Spotify"
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
