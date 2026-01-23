/**
 * INTENT PARSER — Sistema Inteligente & Infinito
 * 200+ comandos específicos + Sistema genérico fallback
 * Cobre praticamente QUALQUER coisa num PC
 */

// =========== CAMADA 1: VALIDAÇÃO DE FRASE ===========
function fraseValida(text) {
  if (!text) return false;
  const trimmed = text.trim();
  const normalized = normalizar(trimmed);
  
  // Padrões conhecidos - aceita mesmo que curta
  if (/^(abra|pesquise|busque|execute|abre|rodae|rodar)\s+/.test(normalized)) {
    return true; // Validado - é um padrão conhecido
  }
  
  // Validação normal
  if (trimmed.length < 6) return false;
  const palavras = trimmed.split(/\s+/).filter(p => p.length > 0);
  if (palavras.length < 2) return false;
  
  return true;
}

// =========== CAMADA 2: NORMALIZAÇÃO AGRESSIVA ===========
function normalizar(text) {
  let normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  // Sinônimos gerais
  normalized = normalized.replace(/cr[oô]m(io|o)?|cromo|clube|clone|cronica/gi, "chrome");
  normalized = normalized.replace(/abr[aã]o|abrão|abre\s/gi, "abra ");
  normalized = normalized.replace(/executar|execute|rodae|rodar/gi, "abra");
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

// =========== BANCO DE DADOS DE APPS (200+) ===========
const APP_DATABASE = {
  // Navegadores
  "chrome": "chrome",
  "google chrome": "chrome",
  "navegador": "chrome",
  "internet": "chrome",
  "edge": "msedge",
  "microsoft edge": "msedge",
  "firefox": "firefox",

  // Microsoft Office
  "word": "winword",
  "documento": "winword",
  "excel": "excel",
  "planilha": "excel",
  "powerpoint": "powerpnt",
  "apresentacao": "powerpnt",
  "outlook": "outlook",
  "email": "outlook",
  "access": "msaccess",
  "banco de dados": "msaccess",
  "publisher": "mspub",
  "onenote": "onenote",
  "notes": "onenote",

  // Google Apps
  "gmail": "https://mail.google.com",
  "drive": "https://drive.google.com",
  "docs": "https://docs.google.com",
  "sheets": "https://sheets.google.com",
  "slides": "https://slides.google.com",
  "calendario": "https://calendar.google.com",
  "calendar": "https://calendar.google.com",
  "fotos": "https://photos.google.com",
  "google fotos": "https://photos.google.com",

  // Apps do Sistema
  "calculadora": "calc",
  "calc": "calc",
  "notepad": "notepad",
  "bloco de notas": "notepad",
  "editor": "notepad",
  "texto": "notepad",
  "paint": "mspaint",
  "desenho": "mspaint",
  "explorer": "explorer",
  "explorador": "explorer",
  "arquivos": "explorer",
  "pastas": "explorer",
  "gerenciador de tarefas": "taskmgr",
  "task manager": "taskmgr",
  "processos": "taskmgr",
  "camera": "camera",
  "fotos": "photos",
  "media player": "wmplayer",
  "reprodutor": "wmplayer",
  "som": "sndvol",
  "volume": "sndvol",
  "relogio": "clock",
  "alarme": "clock",
  "timer": "clock",
  "configuracoes": "ms-settings:",
  "settings": "ms-settings:",
  "painel de controle": "control",
  "controle": "control",
  "impressoras": "control printers",
  "printer": "control printers",
  "bluetooth": "ms-settings:bluetooth",
  "wifi": "ms-settings:network",
  "rede": "ms-settings:network",
  "som": "ms-settings:sound",
  "atualizacoes": "ms-settings:update",
  "updates": "ms-settings:update",

  // Desenvolvimento
  "vscode": "code",
  "visual studio code": "code",
  "vs code": "code",
  "code": "code",
  "editor": "code",
  "sublime": "subl",
  "github": "https://github.com",
  "git": "https://git-scm.com",
  "terminal": "cmd",
  "cmd": "cmd",
  "powershell": "powershell",
  "console": "cmd",
  "terminal": "wt",
  "windows terminal": "wt",

  // Comunicação
  "discord": "discord",
  "slack": "slack",
  "telegram": "telegram",
  "whatsapp": "https://web.whatsapp.com",
  "messenger": "https://www.messenger.com",
  "skype": "skype",
  "zoom": "zoom",
  "teams": "teams",
  "microsoft teams": "teams",

  // Mídia & Entretenimento
  "spotify": "spotify",
  "musica": "spotify",
  "youtube": "https://www.youtube.com",
  "netflix": "https://www.netflix.com",
  "filme": "https://www.netflix.com",
  "serie": "https://www.netflix.com",
  "amazon": "https://www.primevideo.com",
  "prime video": "https://www.primevideo.com",
  "twitch": "https://www.twitch.tv",
  "streaming": "https://www.twitch.tv",
  "hbo": "https://www.hbomax.com",
  "disney": "https://www.disneyplus.com",
  "obs": "obs",
  "obs studio": "obs",
  "transmissao": "obs",
  "recording": "obs",
  "audacity": "audacity",
  "audio": "audacity",
  "vlc": "vlc",
  "video": "vlc",
  "blender": "blender",
  "3d": "blender",
  "photoshop": "photoshop",
  "gimp": "gimp",
  "imagem": "gimp",
  "premiere": "premiere",
  "edicao": "premiere",

  // Redes Sociais
  "facebook": "https://www.facebook.com",
  "instagram": "https://www.instagram.com",
  "twitter": "https://www.twitter.com",
  "x": "https://www.twitter.com",
  "tiktok": "https://www.tiktok.com",
  "reddit": "https://www.reddit.com",
  "linkedin": "https://www.linkedin.com",
  "pinterest": "https://www.pinterest.com",

  // Produtividade
  "notion": "https://www.notion.so",
  "trello": "https://www.trello.com",
  "asana": "https://www.asana.com",
  "todoist": "https://www.todoist.com",
  "evernote": "evernote",
  "onenote": "onenote",

  // Outras ferramentas
  "vimeo": "https://www.vimeo.com",
  "dropbox": "https://www.dropbox.com",
  "onedrive": "https://onedrive.live.com",
  "icloud": "https://www.icloud.com",
  "adobe": "https://www.adobe.com",
  "figma": "https://www.figma.com",
  "canva": "https://www.canva.com",
  "bandicam": "bandicam",
  "fraps": "fraps",
  "utorrent": "utorrent",
  "qbittorrent": "qbittorrent",
  "winrar": "winrar",
  "7zip": "7zfm",
  "compactador": "7zfm",
  "ccleaner": "ccleaner",
  "limpeza": "ccleaner",
  "antivirus": "mssec",
  "windows defender": "mssec",
  "malwarebytes": "malwarebytes",
  "avast": "avast",
  "norton": "norton",
  "kaspersky": "kaspersky",
  "avira": "avira",
  "bitdefender": "bitdefender",
  "mcafee": "mcafee",

  // Jogos & Entretenimento
  "steam": "steam",
  "epic": "https://www.epicgames.com",
  "gog": "https://www.gog.com",
  "origin": "origin",
  "minecraft": "minecraft",
  "roblox": "https://www.roblox.com",

  // Bancos & Finanças
  "nubank": "https://www.nubank.com.br",
  "itau": "https://www.itau.com.br",
  "bradesco": "https://www.bradesco.com.br",
  "caixa": "https://www.caixa.gov.br",
  "banco": "https://www.bb.com.br",

  // E-commerce
  "amazon": "https://www.amazon.com",
  "mercado livre": "https://www.mercadolivre.com.br",
  "aliexpress": "https://www.aliexpress.com",
  "shopee": "https://www.shopee.com.br",
  "ebay": "https://www.ebay.com",
  "wish": "https://www.wish.com",

  // Educação
  "udemy": "https://www.udemy.com",
  "coursera": "https://www.coursera.org",
  "edx": "https://www.edx.org",
  "khan academy": "https://www.khanacademy.org",
  "duolingo": "duolingo",
  "babbel": "https://www.babbel.com",

  // Saúde & Fitness
  "strava": "https://www.strava.com",
  "myfitnesspal": "myfitnesspal",
  "gym": "myfitnesspal",
  "academia": "myfitnesspal",
  "fitbit": "fitbit",
  "apple health": "health",

  // Viagem
  "uber": "https://www.uber.com",
  "airbnb": "https://www.airbnb.com",
  "booking": "https://www.booking.com",
  "hotels": "https://www.hotels.com",
  "skyscanner": "https://www.skyscanner.com",
  "trivago": "https://www.trivago.com",
  "mapa": "https://maps.google.com",
  "google maps": "https://maps.google.com",

  // News & Leitura
  "bbc": "https://www.bbc.com",
  "cnn": "https://www.cnn.com",
  "g1": "https://g1.globo.com",
  "folha": "https://www.folha.uol.com.br",
  "medium": "https://www.medium.com",
  "dev.to": "https://dev.to",
};

// =========== SISTEMA INTELIGENTE ===========
function interpretarComando(texto) {
  // Validação
  if (!fraseValida(texto)) {
    return null;
  }

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

  // "bloco de notas escreva X" OU "o bloco escreva X" OU "escreva no bloco X"
  // Padrão mais flexível para capturar o texto depois de "escreva/digite"
  if ((/bloco|notepad/.test(t)) && (/escreva|escrever|digite|digitar|escriba/.test(t))) {
    // Remove tudo até e incluindo a palavra "escreva/digite"
    let texto = t.replace(/^.*?(escreva|escrever|digite|digitar|escriba)\s+/i, "").trim();
    
    // Se ficou vazio, tenta extrair de outra forma
    if (!texto || texto.length < 2) {
      texto = t
        .replace(/(?:abra|o|a)?\s*(?:bloco|notepad|bloco\s+de\s+notas)\s*/gi, "")
        .replace(/(?:escreva|escrever|digite|digitar|escriba)\s*/gi, "")
        .trim();
    }

    if (texto && texto.length > 0) {
      return {
        type: "pipeline",
        descricao: "Abrir Notepad e escrever",
        steps: [
          { action: "open_app", app: "notepad" },
          { action: "wait", ms: 3000 },
          { action: "type", text: texto }
        ]
      };
    }
  }

  // Padrão genérico: "escreva no [app] X" ou "digite no [app] X"
  const writeMatch = t.match(/(?:escreva|digite|type|escrever|digitar)\s+(?:no|em|a)\s+(\w+(?:\s+\w+)*?)\s+(.+)/);
  if (writeMatch) {
    const appName = writeMatch[1].trim();
    const textToWrite = writeMatch[2].trim();
    const appKey = findAppInDatabase(appName);
    
    if (appKey && !appKey.startsWith("http")) {
      return {
        type: "pipeline",
        descricao: `Escrever "${textToWrite}" no ${appName}`,
        steps: [
          { action: "open_app", app: appKey },
          { action: "wait", ms: 3000 },
          { action: "type", text: textToWrite }
        ]
      };
    }
  }

  // ============ PESQUISA GENÉRICA ===========
  if (/pesquise|pesquisa|pesquisar|procure|busque|buscar/.test(t)) {
    const query = t
      .replace(/pesquise|pesquisa|pesquisar|procure|busque|buscar|no google|no bing|google|bing/gi, "")
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
  }

  // ============ BANCO DE DADOS (200+ comandos) ===========
  for (const [key, value] of Object.entries(APP_DATABASE)) {
    if (t.includes(key)) {
      // Se é URL
      if (value.startsWith("http")) {
        return {
          type: "pipeline",
          descricao: `Abrir ${key}`,
          steps: [
            { action: "navigate", url: value }
          ]
        };
      }

      // Se é app
      if (value.startsWith("ms-settings:") || value.includes(" ")) {
        return {
          type: "pipeline",
          descricao: `Abrir ${key}`,
          steps: [
            { action: "open_app", app: value }
          ]
        };
      }

      // App normal
      return {
        type: "pipeline",
        descricao: `Abrir ${key}`,
        steps: [
          { action: "open_app", app: value }
        ]
      };
    }
  }

  // ============ SISTEMA GENÉRICO FALLBACK ===========
  // Se nada matchou, tenta padrão genérico
  
  // "abra X" ou "execute X"
  const abrapMatch = t.match(/(?:abra|execute|rodae|rodar|abre)\s+(.+?)(?:\s+e\s+|$)/);
  if (abrapMatch) {
    const appName = abrapMatch[1].trim();
    
    // Tenta como URL
    if (appName.includes(".com") || appName.includes(".org")) {
      return {
        type: "pipeline",
        descricao: `Navegar para ${appName}`,
        steps: [
          { action: "navigate", url: `https://${appName}` }
        ]
      };
    }

    // Tenta como app local
    return {
      type: "pipeline",
      descricao: `Abrir ${appName}`,
      steps: [
        { action: "open_app", app: appName }
      ]
    };
  }

  // "pesquise X no google"
  const pesqMatch = t.match(/pesquise\s+(.+?)(?:\s+no|$)/);
  if (pesqMatch) {
    return {
      type: "pipeline",
      descricao: `Pesquisar ${pesqMatch[1]}`,
      steps: [
        { action: "navigate", url: `https://www.google.com/search?q=${encodeURIComponent(pesqMatch[1])}` }
      ]
    };
  }

  // Sem match
  return null;
}

// =========== HELPER: Procurar app no banco ===========
function findAppInDatabase(appName) {
  const normalized = normalizar(appName);
  for (const [key, value] of Object.entries(APP_DATABASE)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return value;
    }
  }
  return null;
}

module.exports = {
  interpretarComando,
  fraseValida,
  normalizar
};
