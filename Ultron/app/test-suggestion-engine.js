const { generateSuggestions } = require('./intelligence/suggestion_engine');
const fs = require('fs');
const path = require('path');

console.log('\n✅ TESTE: Suggestion Engine\n');

// Teste 1: Gerar sugestões
const suggestions = generateSuggestions();

console.log('📊 Sugestões geradas:');
if (suggestions.length === 0) {
  console.log('   ℹ️  Nenhuma sugestão disponível (padrão insuficiente)');
} else {
  suggestions.forEach((sug, i) => {
    console.log(`\n   [${i+1}] ${sug.mission}`);
    console.log(`       Razão: ${sug.reason}`);
    console.log(`       Confiança: ${(sug.confidence * 100).toFixed(0)}%`);
    console.log(`       Hora recomendada: ${sug.recommended_time}`);
    console.log(`       Severidade: ${sug.severity}`);
  });
}

// Teste 2: Verificar estrutura de dados
console.log('\n📈 Estatísticas do perfil:');
const { loadProfile } = require('./intelligence/user_profile');
const profile = loadProfile();

if (profile.missions?.cleanup_system) {
  const cleanup = profile.missions.cleanup_system;
  console.log(`   cleanup_system:`);
  console.log(`     - Autorizações: ${cleanup.authorized}`);
  console.log(`     - Recusas: ${cleanup.denied}`);
  console.log(`     - Confiança: ${(cleanup.confidence * 100).toFixed(0)}%`);
  console.log(`     - Total de amostras: ${cleanup.total_samples}`);
}

if (profile.missions?.check_health) {
  const health = profile.missions.check_health;
  console.log(`   check_health:`);
  console.log(`     - Autorizações: ${health.authorized}`);
  console.log(`     - Recusas: ${health.denied}`);
  console.log(`     - Confiança: ${(health.confidence * 100).toFixed(0)}%`);
  console.log(`     - Total de amostras: ${health.total_samples}`);
}

// Teste 3: Histórico recente
console.log('\n📜 Histórico recente (últimas 3):');
const historyPath = path.join(__dirname, 'missions', 'history.json');
if (fs.existsSync(historyPath)) {
  const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
  const recent = history.slice(-3);
  recent.forEach((h, i) => {
    console.log(`   [${i+1}] ${h.mission} - ${h.status} (${h.at})`);
  });
} else {
  console.log('   ℹ️  Arquivo de histórico não encontrado');
}

console.log('\n✅ Suggestion Engine está operacional\n');
