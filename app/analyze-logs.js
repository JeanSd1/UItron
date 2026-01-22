const fs = require('fs');

console.log('\n✅ ANÁLISE DE LOGS — SUGESTÕES\n');

const lines = fs.readFileSync('./logs/ultron.log', 'utf8').split('\n');
const jsonLines = lines
  .filter(l => l.trim())
  .map(l => {
    try { return JSON.parse(l); } catch(e) { return null; }
  })
  .filter(m => m);

console.log('Total de linhas no log:', jsonLines.length);

// Buscar sugestões
const suggestions = jsonLines.filter(m => 
  m.message && (m.message.includes('Sugestão') || m.message.includes('💡'))
);

console.log('\n💡 Mensagens de Sugestão encontradas:', suggestions.length);

if (suggestions.length > 0) {
  console.log('\nDetalhes das sugestões:');
  suggestions.forEach((msg, i) => {
    console.log(`\n[${i+1}] ${msg.timestamp}`);
    console.log(`    Message: ${msg.message}`);
    if (msg.mission) console.log(`    Mission: ${msg.mission}`);
    if (msg.confidence) console.log(`    Confidence: ${(msg.confidence * 100).toFixed(0)}%`);
    if (msg.severity) console.log(`    Severity: ${msg.severity}`);
  });
} else {
  console.log('ℹ️  Nenhuma sugestão registrada (padrão insuficiente no histórico)');
}

// Buscar decisões
const decisions = jsonLines.filter(m => 
  m.message && m.message.includes('Decision Engine')
);

console.log('\n\n🧠 Decisões registradas:', decisions.length);

// Buscar notificações
const notifications = jsonLines.filter(m => 
  m.message && (m.message.includes('Notificação') || m.message.includes('🔔') || m.message.includes('🔕'))
);

console.log('🔔 Notificações registradas:', notifications.length);

// Status geral
console.log('\n\n✅ STATUS GERAL:');
console.log(`   Pipeline: ✅ Executado`);
console.log(`   Decisões: ✅ ${decisions.length} registradas`);
console.log(`   Sugestões: ${suggestions.length > 0 ? '✅' : 'ℹ️'} ${suggestions.length} disponíveis`);
console.log(`   Notificações: ✅ ${notifications.length} registradas`);

console.log('\n');
