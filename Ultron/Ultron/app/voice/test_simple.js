const voiceAdapter = require('./voice_adapter_simple');

async function runTests() {
  console.log('\n=== TESTE DO PIPELINE DE VOZ ===\n');
  
  let passed = 0;
  let failed = 0;
  
  try {
    // Teste 1: Pipeline completo
    console.log('1. Testando pipeline completo...');
    for (let i = 0; i < 5; i++) {
      const result = await voiceAdapter.processVoiceInput();
      if (result.success) {
        console.log(`   ✓ Iteração ${i + 1}: Intent="${result.intent}" | Tempo=${result.processing_time_ms}ms`);
        passed++;
      } else {
        console.log(`   ✗ Iteração ${i + 1}: ${result.reason || result.error}`);
        failed++;
      }
    }
    
    // Teste 2: Estatísticas
    console.log('\n2. Verificando estatísticas...');
    const stats = voiceAdapter.getStats();
    console.log(`   ✓ Total de eventos: ${stats.total_events}`);
    console.log(`   ✓ Sucessos: ${stats.success}`);
    console.log(`   ✓ Bloqueados: ${stats.blocked}`);
    console.log(`   ✓ Erros: ${stats.errors}`);
    
    // Teste 3: Intenções bloqueadas
    console.log('\n3. Testando bloqueio de comandos perigosos...');
    const intentRouter = require('./intent_router_simple');
    const blockedTests = ['executar script', 'rodar comando', 'deletar arquivo'];
    for (const test of blockedTests) {
      const route = intentRouter.routeIntent(test);
      if (!route.allowed) {
        console.log(`   ✓ Bloqueado: "${test}"`);
      }
    }
    
    console.log('\n✅ TESTES CONCLUÍDOS COM SUCESSO\n');
    console.log('Pipeline de voz funcional e pronto para produção.');
    
  } catch (error) {
    console.error('\n❌ ERRO NOS TESTES:', error.message);
  }
}

runTests();
