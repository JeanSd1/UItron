const config = require('./voice_config.json');

function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[áàâã]/g, 'a')
    .replace(/[éè]/g, 'e')
    .replace(/[í]/g, 'i')
    .replace(/[óõô]/g, 'o')
    .replace(/[ú]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s]/g, '');
}

async function transcribe(audioBuffer) {
  // Simular transcrição offline
  const mockTexts = [
    'qual é o status',
    'mostrar métricas',
    'quais foram as decisões',
    'histórico completo',
    'explica isso',
    'ajuda'
  ];
  
  const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
  
  return {
    success: true,
    text: randomText,
    normalized: normalizeText(randomText),
    confidence: 0.85,
    engine: 'offline',
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  transcribe,
  normalizeText
};
