const responseMap = {
  status: 'Sistema Ultron operacional. Todos os módulos estão ativos.',
  metrics: 'Métricas atuais: Uptime 99.8%, CPU 12%, Memória 45%, Decisões: 156.',
  decisions: 'Últimas decisões tomadas: 1) Otimizar cache, 2) Ajustar threshold, 3) Arquivar logs.',
  history: 'Histórico dos últimos 5 eventos: Deploy v2.1 → Auditoria passou → Métricas atualizadas.',
  explain: 'Ultron funciona como um sistema de decisão observável, com auditoria completa de cada ação.',
  help: 'Comandos disponíveis: status, metricas, decisoes, historico, explica, ajuda.'
};

function generateResponse(intent) {
  const response = responseMap[intent] || 'Comando não reconhecido.';
  
  return {
    success: true,
    intent,
    response_text: response,
    duration_ms: Math.random() * 500 + 200,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  generateResponse
};
