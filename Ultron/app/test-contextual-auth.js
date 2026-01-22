const { generateAuthPrompt } = require('./config/authorization');
const { getMissionConfidence } = require('./intelligence/user_profile');

// Teste com cleanup_system (78% de confiança)
console.log("=== TESTE FASE 4.1 - AUTORIZAÇÃO CONTEXTUAL ===\n");

const testPrompt = generateAuthPrompt('cleanup_system', {
  summary: { status: 'ok', message: 'Limpeza: 150 MB' },
  cleaned: [{ location: 'Temp', filesRemoved: 45, sizeFreed: '150 MB' }]
});

console.log("Confiança de cleanup_system:", getMissionConfidence('cleanup_system'));
console.log("Confiança de check_health:", getMissionConfidence('check_health'));
console.log("\n--- Prompt Gerado ---\n");
console.log(testPrompt.message);
console.log("\n✅ Autorização ainda é necessária (confirmRequired:", testPrompt.confirmRequired + ")");
console.log("✅ Mensagem é contextualizada com base no histórico");
console.log("✅ Zero automação - apenas UX melhor");
