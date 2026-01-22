const config = require('./voice_config.json');

function routeIntent(normalizedText) {
  // Verificar blacklist
  for (const keyword of config.blocked_keywords) {
    if (normalizedText.includes(keyword)) {
      return {
        success: false,
        blocked: true,
        reason: `Keyword bloqueado: ${keyword}`,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // Mapear para intents
  const intentMap = {
    'status': ['status', 'como vai', 'situacao'],
    'metrics': ['metrica', 'mostrar', 'dados', 'numeros'],
    'decisions': ['decisao', 'decidiu', 'escolha'],
    'history': ['historico', 'passado', 'antes'],
    'explain': ['explica', 'por que', 'como funciona'],
    'help': ['ajuda', 'socorro', 'duvida']
  };
  
  for (const [intent, patterns] of Object.entries(intentMap)) {
    for (const pattern of patterns) {
      if (normalizedText.includes(pattern)) {
        return {
          success: true,
          intent,
          matched_pattern: pattern,
          allowed: true,
          timestamp: new Date().toISOString()
        };
      }
    }
  }
  
  return {
    success: false,
    intent: 'unknown',
    allowed: false,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  routeIntent
};
