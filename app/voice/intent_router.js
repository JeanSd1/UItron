/**
 * Intent Router por VOZ — ULTRON
 * Determinístico, whitelist-only, auditável
 */

const INTENTS = [
  {
    name: "get_time",
    patterns: [
      "que horas são",
      "qual é a hora",
      "me diga a hora",
      "hora agora"
    ]
  },
  {
    name: "system_status",
    patterns: [
      "como está o sistema",
      "status do sistema",
      "estado do sistema",
      "sistema está bem"
    ]
  },
  {
    name: "list_files",
    patterns: [
      "listar arquivos",
      "mostrar arquivos",
      "ver arquivos"
    ]
  },
  {
    name: "help",
    patterns: [
      "ajuda",
      "o que você pode fazer",
      "comandos disponíveis"
    ]
  }
];

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function matchIntent(command) {
  const text = normalize(command);

  for (const intent of INTENTS) {
    for (const pattern of intent.patterns) {
      if (text.includes(normalize(pattern))) {
        return {
          intent: intent.name,
          confidence: 0.85,
          source: "voice"
        };
      }
    }
  }

  return {
    intent: "unknown",
    confidence: 0.0,
    source: "voice"
  };
}

module.exports = {
  matchIntent
};
