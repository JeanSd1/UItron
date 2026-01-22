/**
 * INTENT PARSER — Camada de Intenção
 * Converte texto em intenção executável
 * Tipos: "app", "url", "system"
 */

function interpretarComando(texto) {
  const t = texto.toLowerCase().trim();

  // ============ URLs (Web) ============
  
  // 🎬 YOUTUBE
  if (t.includes("youtube")) {
    return {
      type: "url",
      value: "https://www.youtube.com",
      descricao: "YouTube"
    };
  }

  // 📘 FACEBOOK
  if (t.includes("facebook")) {
    return {
      type: "url",
      value: "https://www.facebook.com",
      descricao: "Facebook"
    };
  }

  // 🐦 TWITTER/X
  if (t.includes("twitter") || t.includes("x.com")) {
    return {
      type: "url",
      value: "https://www.twitter.com",
      descricao: "Twitter"
    };
  }

  // 🔴 REDDIT
  if (t.includes("reddit")) {
    return {
      type: "url",
      value: "https://www.reddit.com",
      descricao: "Reddit"
    };
  }

  // 🔍 PESQUISA GOOGLE (intenção forte)
  if (
    t.includes("pesquise") ||
    t.includes("pesquisa") ||
    t.includes("pesquisar") ||
    t.includes("procure")
  ) {
    const query = t
      .replace(/pesquise|pesquisa|pesquisar|procure/g, "")
      .replace(/no google|google/g, "")
      .trim();

    if (query.length < 2) {
      return { type: "url", value: "https://www.google.com", descricao: "Google" };
    }

    return {
      type: "url",
      value: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      descricao: `Pesquisar: ${query}`
    };
  }

  // ============ APPS (Executáveis) ============

  // 🌐 NAVEGADOR (Chrome/Edge)
  if (
    t.includes("navegador") ||
    t.includes("chrome") ||
    t.includes("crômica") ||
    t.includes("cronica") ||
    t.includes("clone")
  ) {
    return {
      type: "app",
      value: "chrome",
      descricao: "Abrir navegador (Chrome)"
    };
  }

  // 🧮 CALCULADORA
  if (
    t.includes("calculadora") ||
    t.includes("calc") ||
    t.includes("calcular")
  ) {
    return {
      type: "app",
      value: "calc",
      descricao: "Abrir calculadora"
    };
  }

  // 📝 NOTEPAD
  if (
    t.includes("notepad") ||
    t.includes("bloco") ||
    t.includes("editor") ||
    t.includes("texto")
  ) {
    return {
      type: "app",
      value: "notepad",
      descricao: "Abrir Notepad"
    };
  }

  // 📁 EXPLORADOR
  if (
    t.includes("explorador") ||
    t.includes("explorer") ||
    t.includes("pastas") ||
    t.includes("arquivos")
  ) {
    return {
      type: "app",
      value: "explorer",
      descricao: "Abrir Explorador"
    };
  }

  // 🎮 DISCORD
  if (t.includes("discord")) {
    return {
      type: "app",
      value: "discord",
      descricao: "Abrir Discord"
    };
  }

  // 💬 TELEGRAM
  if (t.includes("telegram")) {
    return {
      type: "app",
      value: "telegram",
      descricao: "Abrir Telegram"
    };
  }

  // 🎬 OBS (Streaming)
  if (t.includes("obs")) {
    return {
      type: "app",
      value: "obs",
      descricao: "Abrir OBS Studio"
    };
  }

  // 💻 VSCODE
  if (
    t.includes("vscode") ||
    t.includes("visual studio") ||
    t.includes("code")
  ) {
    return {
      type: "app",
      value: "code",
      descricao: "Abrir Visual Studio Code"
    };
  }

  // 🎵 SPOTIFY
  if (t.includes("spotify")) {
    return {
      type: "app",
      value: "spotify",
      descricao: "Abrir Spotify"
    };
  }

  // ============ SYSTEM (Comandos do sistema) ============

  // 🔊 VOLUME
  if (t.includes("aumentar volume") || t.includes("mais volume")) {
    return {
      type: "system",
      value: "volume-up",
      descricao: "Aumentar volume"
    };
  }

  if (t.includes("diminuir volume") || t.includes("menos volume")) {
    return {
      type: "system",
      value: "volume-down",
      descricao: "Diminuir volume"
    };
  }

  // Sem match
  return null;
}

module.exports = {
  interpretarComando
};
