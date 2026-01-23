const { canNotifyNow } = require('./intelligence/notification_policy');

console.log('\n✅ TESTE: Notification Policy Integration\n');

// Hora atual
const now = new Date();
const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

console.log(`📍 Hora atual: ${currentTime}`);
console.log(`📋 Profile preferences: 09:00-22:00 (notificação)\n`);

// Verificar política
const result = canNotifyNow();

console.log(`🔎 Resultado da verificação:`);
console.log(`   Permitido: ${result.allowed ? '✅ SIM' : '❌ NÃO'}`);
console.log(`   Razão: ${result.reason}`);
console.log('');

// Explicar
if (result.allowed) {
  console.log('🔔 → Notificação SERÁ ENVIADA\n');
} else {
  console.log(`🔕 → Notificação SUPRIMIDA (${result.reason})\n`);
}

// Simular diferentes horários
console.log('📊 Simulação de horários:');
console.log('   08:59 (fora da janela)  → outside_notification_window');
console.log('   09:00-22:00 (janela)    → ok');
console.log('   22:00-08:59 (silêncio)  → silent_hours');
console.log('');
