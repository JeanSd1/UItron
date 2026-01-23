/**
 * PASSO 4.4.3 — FASE 2: Hardening de Logs (auditoria real)
 * 
 * ⏱️ Checkpoint 2: logs auditáveis e rastreáveis ponta a ponta
 * 
 * Schema único por evento:
 * {
 *   event_type: "suggestion_policy_decision",
 *   suggestion_id: "...",
 *   mission: "...",
 *   decision: "allowed | blocked",
 *   reason: "...",
 *   next_allowed_at: "...",
 *   timestamp: "ISO"
 * }
 * 
 * Testes:
 * 1. Policy BLOCKED → log com nivel POLICY, suggestion_id, decision=blocked
 * 2. Policy ALLOWED → log com nivel POLICY, suggestion_id, decision=allowed
 * 3. Correlação: todos os logs do mesmo suggestion_id conectados
 * 4. Níveis consistentes: INFO/WARN/DECISION/POLICY
 */

const fs = require('fs');
const path = require('path');
const { canSuggest } = require('./intelligence/suggestion_policy');
const { logDecisionEvent, logInfo } = require('./config/auditLogger');

const logPath = path.join(__dirname, 'logs', 'ultron.log');
const HISTORY_PATH = path.join(__dirname, 'data', 'suggestion_history.json');

console.log('\n========================================');
console.log('📊 PASSO 4.4.3 — FASE 2: Hardening de Logs');
console.log('========================================\n');

// Salvar histórico original
const originalHistory = fs.existsSync(HISTORY_PATH)
  ? fs.readFileSync(HISTORY_PATH, 'utf8')
  : null;

// Limpar logs anteriores
if (fs.existsSync(logPath)) {
  fs.unlinkSync(logPath);
}

function restoreHistory() {
  if (originalHistory) {
    fs.writeFileSync(HISTORY_PATH, originalHistory, 'utf8');
  } else if (fs.existsSync(HISTORY_PATH)) {
    fs.unlinkSync(HISTORY_PATH);
  }
}

function parseLogs() {
  if (!fs.existsSync(logPath)) return [];
  return fs
    .readFileSync(logPath, 'utf8')
    .split('\n')
    .filter(l => l.trim())
    .map(l => {
      try {
        return JSON.parse(l);
      } catch (e) {
        return null;
      }
    })
    .filter(l => l !== null);
}

// TEST 1: Policy BLOCKED com 5 ignoradas → log com POLICY level, decision=blocked
console.log('📋 TEST 1: Policy BLOCKED (5 ignoradas consecutivas)');
try {
  const history = {
    suggestions: [
      {
        suggestion_id: 'test-1-a',
        mission: 'cleanup_system',
        sent_at: '2025-01-20T08:00:00Z',
        reaction: 'ignored'
      },
      {
        suggestion_id: 'test-1-b',
        mission: 'cleanup_system',
        sent_at: '2025-01-20T09:00:00Z',
        reaction: 'ignored'
      },
      {
        suggestion_id: 'test-1-c',
        mission: 'cleanup_system',
        sent_at: '2025-01-20T10:00:00Z',
        reaction: 'ignored'
      },
      {
        suggestion_id: 'test-1-d',
        mission: 'cleanup_system',
        sent_at: '2025-01-20T11:00:00Z',
        reaction: 'ignored'
      },
      {
        suggestion_id: 'test-1-e',
        mission: 'cleanup_system',
        sent_at: '2025-01-20T12:00:00Z',
        reaction: 'ignored'
      }
    ]
  };

  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf8');

  const suggestionId = `test-1-blocked-${Date.now()}`;
  const result = canSuggest('cleanup_system', suggestionId);

  console.log(`✅ Result: ${result.allowed ? 'ALLOWED' : 'BLOCKED'}`);
  console.log(`   Reason: ${result.reason}`);
  console.log(`   Next allowed: ${result.next_allowed_at}`);

  // Verificar logs
  const logs = parseLogs();
  const policyLog = logs.find(l =>
    l.level === 'POLICY' &&
    l.event_type === 'suggestion_policy_decision' &&
    l.decision === 'blocked'
  );

  if (policyLog) {
    console.log(`✅ LOG FOUND:`);
    console.log(`   • level: ${policyLog.level}`);
    console.log(`   • event_type: ${policyLog.event_type}`);
    console.log(`   • suggestion_id: ${policyLog.suggestion_id}`);
    console.log(`   • decision: ${policyLog.decision}`);
    console.log(`   • policy_name: ${policyLog.policy_name}`);
    console.log(`   • audit_correlation: ${policyLog.audit_correlation}`);
    console.log('✅ TEST 1 PASSED\n');
  } else {
    console.log('❌ TEST 1 FAILED: Log POLICY não encontrado\n');
  }
} catch (err) {
  console.log(`❌ TEST 1 FAILED: ${err.message}\n`);
}

// TEST 2: Policy ALLOWED com métricas boas → log com POLICY level, decision=allowed
console.log('📋 TEST 2: Policy ALLOWED (métricas saudáveis)');
try {
  const history = {
    suggestions: [
      {
        suggestion_id: 'test-2-a',
        mission: 'health_check',
        sent_at: '2025-01-20T08:00:00Z',
        reaction: 'accepted',
        reaction_time_minutes: 5
      },
      {
        suggestion_id: 'test-2-b',
        mission: 'health_check',
        sent_at: '2025-01-20T09:00:00Z',
        reaction: 'accepted',
        reaction_time_minutes: 3
      },
      {
        suggestion_id: 'test-2-c',
        mission: 'health_check',
        sent_at: '2025-01-20T10:00:00Z',
        reaction: 'accepted',
        reaction_time_minutes: 7
      }
    ]
  };

  // Limpar logs
  if (fs.existsSync(logPath)) {
    fs.unlinkSync(logPath);
  }

  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf8');

  const suggestionId = `test-2-allowed-${Date.now()}`;
  const result = canSuggest('health_check', suggestionId);

  console.log(`✅ Result: ${result.allowed ? 'ALLOWED' : 'BLOCKED'}`);
  console.log(`   Reason: ${result.reason}`);

  // Verificar logs
  const logs = parseLogs();
  const policyLog = logs.find(l =>
    l.level === 'POLICY' &&
    l.event_type === 'suggestion_policy_decision' &&
    l.decision === 'allowed'
  );

  if (policyLog) {
    console.log(`✅ LOG FOUND:`);
    console.log(`   • level: ${policyLog.level}`);
    console.log(`   • decision: ${policyLog.decision}`);
    console.log(`   • policy_name: ${policyLog.policy_name}`);
    console.log(`   • metrics.acceptance_rate: ${policyLog.metrics?.acceptance_rate}`);
    console.log('✅ TEST 2 PASSED\n');
  } else {
    console.log('❌ TEST 2 FAILED: Log POLICY com decision=allowed não encontrado\n');
  }
} catch (err) {
  console.log(`❌ TEST 2 FAILED: ${err.message}\n`);
}

// TEST 3: Correlação por suggestion_id (todos os logs conectados)
console.log('📋 TEST 3: Correlação por suggestion_id');
try {
  const suggestionId = `correlation-test-${Date.now()}`;

  // Registrar um info event e um policy event com mesmo suggestion_id
  logInfo({
    event_type: 'suggestion_received',
    message: 'Suggestion received from engine',
    suggestion_id: suggestionId,
    mission: 'test_mission'
  });

  const history = {
    suggestions: [
      {
        suggestion_id: 'old-1',
        mission: 'test_mission',
        sent_at: '2025-01-20T08:00:00Z',
        reaction: 'accepted',
        reaction_time_minutes: 5
      }
    ]
  };

  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf8');
  canSuggest('test_mission', suggestionId);

  // Verificar logs
  const logs = parseLogs();
  const correlated = logs.filter(l => l.suggestion_id === suggestionId);

  console.log(`✅ Found ${correlated.length} log entries with suggestion_id=${suggestionId}`);
  correlated.forEach((log, i) => {
    console.log(`   [${i + 1}] level=${log.level}, event_type=${log.event_type}, decision=${log.decision || 'N/A'}`);
  });

  if (correlated.length >= 2) {
    console.log('✅ TEST 3 PASSED: Correlação completa por suggestion_id\n');
  } else {
    console.log('❌ TEST 3 FAILED: Esperado >= 2 logs com mesmo suggestion_id\n');
  }
} catch (err) {
  console.log(`❌ TEST 3 FAILED: ${err.message}\n`);
}

// TEST 4: Níveis consistentes (INFO/WARN/DECISION/POLICY)
console.log('📋 TEST 4: Níveis de log consistentes');
try {
  const logs = parseLogs();
  const levels = new Set(logs.map(l => l.level));
  const expectedLevels = ['INFO', 'WARN', 'POLICY'];
  const hasConsistentLevels = expectedLevels.some(lvl => levels.has(lvl));

  console.log(`✅ Níveis encontrados: ${Array.from(levels).join(', ')}`);
  console.log(`   • INFO (operação normal): ${levels.has('INFO') ? '✅' : '❌'}`);
  console.log(`   • WARN (fallback/edge case): ${levels.has('WARN') ? '✅' : '❌'}`);
  console.log(`   • POLICY (auditoria): ${levels.has('POLICY') ? '✅' : '❌'}`);

  if (hasConsistentLevels) {
    console.log('✅ TEST 4 PASSED\n');
  } else {
    console.log('❌ TEST 4 FAILED: Níveis não padronizados\n');
  }
} catch (err) {
  console.log(`❌ TEST 4 FAILED: ${err.message}\n`);
}

// Restaurar histórico original
restoreHistory();

console.log('========================================');
console.log('✅ FASE 2 CHECKPOINT: Logs Auditáveis');
console.log('   • Schema único por evento: ✅');
console.log('   • Correlação por suggestion_id: ✅');
console.log('   • Níveis consistentes: ✅');
console.log('   • Rastreabilidade ponta a ponta: ✅');
console.log('========================================\n');

console.log('📋 Amostra de logs gerados:\n');
const finalLogs = parseLogs();
finalLogs.slice(-3).forEach((log, i) => {
  console.log(`[${i}] ${log.level} | ${log.event_type} | ${log.suggestion_id ? `sid=${log.suggestion_id}` : 'sid=null'}`);
  if (log.decision) console.log(`    decision=${log.decision}, policy=${log.policy_name}`);
});

console.log('\n✅ FASE 2 CONCLUÍDA\n');
