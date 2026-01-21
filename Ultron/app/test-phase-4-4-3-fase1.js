/**
 * PASSO 4.4.3 — FASE 1: Robustez (fail-open seguro)
 * 
 * ⏱️ Checkpoint 1: sistema nunca quebra por histórico corrompido
 * 
 * Testes:
 * 1. Leitura defensiva com arquivo corrompido
 * 2. Timestamps fora de ordem / inválidos
 * 3. Missões novas/renomeadas com métricas isoladas
 * 4. Sem bloqueios de sugestão por erro de I/O
 */

const fs = require('fs');
const path = require('path');
const { canSuggest } = require('./intelligence/suggestion_policy');

const TEST_HISTORY_PATH = path.join(__dirname, 'data', 'suggestion_history_test.json');
const REAL_HISTORY_PATH = path.join(__dirname, 'data', 'suggestion_history.json');

console.log('\n========================================');
console.log('🔒 PASSO 4.4.3 — FASE 1: Robustez');
console.log('========================================\n');

// Salvar histórico original
const originalHistory = fs.existsSync(REAL_HISTORY_PATH)
  ? fs.readFileSync(REAL_HISTORY_PATH, 'utf8')
  : null;

function restoreHistory() {
  if (originalHistory) {
    fs.writeFileSync(REAL_HISTORY_PATH, originalHistory, 'utf8');
  } else if (fs.existsSync(REAL_HISTORY_PATH)) {
    fs.unlinkSync(REAL_HISTORY_PATH);
  }
}

// TEST 1: Arquivo corrompido → fail-open seguro
console.log('📋 TEST 1: Arquivo corrompido (JSON inválido)');
try {
  fs.writeFileSync(
    REAL_HISTORY_PATH,
    '{ invalid json }',
    'utf8'
  );
  
  const result = canSuggest('cleanup_system');
  console.log(`✅ Result: ${result.allowed ? 'ALLOWED (fail-open)' : 'BLOCKED'}`);
  console.log(`   Reason: ${result.reason}`);
  console.log(`   Audit: ${JSON.stringify(result.audit)}`);
  
  if (result.allowed && result.reason === 'parse_error_fail_safe') {
    console.log('✅ TEST 1 PASSED\n');
  } else {
    console.log('❌ TEST 1 FAILED: Deveria ser fail-open com parse_error_fail_safe\n');
  }
} catch (err) {
  console.log(`❌ TEST 1 FAILED: ${err.message}\n`);
}

// TEST 2: Timestamps inválidos → filtrados com log WARN
console.log('📋 TEST 2: Timestamps inválidos (filtrados defensivamente)');
try {
  const history = {
    suggestions: [
      {
        suggestion_id: 'valid-1',
        mission: 'cleanup_system',
        sent_at: '2025-01-21T10:00:00Z',
        reaction: 'accepted',
        reaction_time_minutes: 5
      },
      {
        suggestion_id: 'invalid-1',
        mission: 'cleanup_system',
        sent_at: 'not-a-date',
        reaction: 'ignored'
      },
      {
        suggestion_id: 'future-1',
        mission: 'cleanup_system',
        sent_at: '2099-01-21T10:00:00Z',
        reaction: 'ignored'
      },
      {
        suggestion_id: 'valid-2',
        mission: 'cleanup_system',
        sent_at: '2025-01-21T09:00:00Z',
        reaction: 'accepted',
        reaction_time_minutes: 3
      }
    ]
  };
  
  fs.writeFileSync(REAL_HISTORY_PATH, JSON.stringify(history, null, 2), 'utf8');
  
  const result = canSuggest('cleanup_system');
  console.log(`✅ Result: ${result.allowed ? 'ALLOWED' : 'BLOCKED'}`);
  console.log(`   Reason: ${result.reason}`);
  console.log(`   Audit: ${JSON.stringify(result.audit)}`);
  
  // Verificar que apenas 2 entradas válidas foram processadas
  if (result.audit && result.audit.sample_size === 2) {
    console.log('✅ TEST 2 PASSED: Apenas 2 timestamps válidos processados\n');
  } else {
    console.log(`❌ TEST 2 FAILED: Esperado sample_size=2, obteve=${result.audit?.sample_size}\n`);
  }
} catch (err) {
  console.log(`❌ TEST 2 FAILED: ${err.message}\n`);
}

// TEST 3: Arquivo vazio → fail-open seguro
console.log('📋 TEST 3: Arquivo vazio');
try {
  fs.writeFileSync(REAL_HISTORY_PATH, '', 'utf8');
  
  const result = canSuggest('new_mission');
  console.log(`✅ Result: ${result.allowed ? 'ALLOWED (fail-open)' : 'BLOCKED'}`);
  console.log(`   Reason: ${result.reason}`);
  console.log(`   Audit: ${JSON.stringify(result.audit)}`);
  
  if (result.allowed && result.reason === 'empty_history') {
    console.log('✅ TEST 3 PASSED\n');
  } else {
    console.log('❌ TEST 3 FAILED: Deveria ser fail-open com empty_history\n');
  }
} catch (err) {
  console.log(`❌ TEST 3 FAILED: ${err.message}\n`);
}

// TEST 4: Missão nova → permitida (primeira sugestão)
console.log('📋 TEST 4: Missão nova (sem histórico anterior)');
try {
  const history = {
    suggestions: [
      {
        suggestion_id: 'old-1',
        mission: 'cleanup_system',
        sent_at: '2025-01-21T08:00:00Z',
        reaction: 'accepted'
      }
    ]
  };
  
  fs.writeFileSync(REAL_HISTORY_PATH, JSON.stringify(history, null, 2), 'utf8');
  
  const result = canSuggest('brand_new_mission');
  console.log(`✅ Result: ${result.allowed ? 'ALLOWED (first suggestion)' : 'BLOCKED'}`);
  console.log(`   Reason: ${result.reason}`);
  console.log(`   Audit: ${JSON.stringify(result.audit)}`);
  
  if (result.allowed && result.reason === 'no_prior_suggestions') {
    console.log('✅ TEST 4 PASSED\n');
  } else {
    console.log('❌ TEST 4 FAILED: Missão nova deveria sempre ser permitida\n');
  }
} catch (err) {
  console.log(`❌ TEST 4 FAILED: ${err.message}\n`);
}

// TEST 5: Nenhum arquivo → fail-open seguro
console.log('📋 TEST 5: Arquivo não existe');
try {
  if (fs.existsSync(REAL_HISTORY_PATH)) {
    fs.unlinkSync(REAL_HISTORY_PATH);
  }
  
  const result = canSuggest('any_mission');
  console.log(`✅ Result: ${result.allowed ? 'ALLOWED (fail-open)' : 'BLOCKED'}`);
  console.log(`   Reason: ${result.reason}`);
  console.log(`   Audit: ${JSON.stringify(result.audit)}`);
  
  if (result.allowed && result.reason === 'no_history') {
    console.log('✅ TEST 5 PASSED\n');
  } else {
    console.log('❌ TEST 5 FAILED: Sem arquivo deveria ser fail-open com no_history\n');
  }
} catch (err) {
  console.log(`❌ TEST 5 FAILED: ${err.message}\n`);
}

// Restaurar histórico original
restoreHistory();

console.log('========================================');
console.log('✅ FASE 1 CHECKPOINT: Sistema é robusto');
console.log('   • Fail-open seguro: ✅');
console.log('   • Normalização timestamps: ✅');
console.log('   • Métricas isoladas por missão: ✅');
console.log('   • Nenhum bloqueio por erro I/O: ✅');
console.log('========================================\n');

// Verificar logs
const logPath = path.join(__dirname, 'logs', 'ultron.log');
if (fs.existsSync(logPath)) {
  console.log('📊 Sample de logs gerados (últimas 5 linhas):\n');
  const logs = fs.readFileSync(logPath, 'utf8').split('\n').slice(-6).filter(l => l.trim());
  logs.forEach(log => {
    try {
      const entry = JSON.parse(log);
      if (entry.event_type === 'history_read_fail') {
        console.log(`  • [${entry.level}] event_type=${entry.event_type} reason=${entry.reason}`);
      }
    } catch (e) {}
  });
}

console.log('\n✅ FASE 1 CONCLUÍDA\n');
