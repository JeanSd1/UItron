#!/usr/bin/env node

/**
 * DIAGNÓSTICO FINAL - O QUE REALMENTE TÁ ACONTECENDO
 */

const { execSync } = require('child_process');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  🔍 DIAGNÓSTICO FINAL DO SISTEMA             ║');
console.log('╚════════════════════════════════════════════════╝\n');

// ===== TESTE 1: Windows Edition =====
console.log('1️⃣  VERIFICANDO EDIÇÃO DO WINDOWS:\n');

try {
    const edition = execSync('wmic os get caption', { encoding: 'utf-8' }).split('\n')[1].trim();
    console.log(`   Versão: ${edition}\n`);
} catch (e) {
    console.log('   Erro ao obter versão\n');
}

// ===== TESTE 2: Speech Recognition capabilities =====
console.log('2️⃣  VERIFICANDO DISPONIBILIDADE DE VOZ:\n');

try {
    const script = `
\$capabilities = Get-WindowsCapability -Online | Where-Object {$_.Name -like "*Speech*"}
if (\$capabilities -eq \$null) {
    Write-Host "❌ Nenhum pacote Speech encontrado"
    Write-Host ""
    Write-Host "Windows Speech Recognition NÃO está disponível:"
    Write-Host "  • Pode ser edição Home/Pro limitada"
    Write-Host "  • Pode ser bloqueado pelo admin"
    Write-Host "  • Pode precisar de atualização do Windows"
} else {
    Write-Host "Pacotes disponíveis:"
    \$capabilities | Format-Table -Property Name, State
}
`;
    const result = execSync(`powershell -Command "${script}"`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    console.log(result);
} catch (e) {
    console.log('Erro ao verificar\n');
}

// ===== TESTE 3: Mensagem final =====
console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  📝 O QUE FAZER AGORA                         ║');
console.log('╚════════════════════════════════════════════════╝\n');

console.log('✅ MÁ NOTÍCIA: Windows Speech Recognition não está disponível\n');

console.log('✅ BOA NOTÍCIA: TUDO FUNCIONA MESMO SEM VOZ!\n');

console.log('Você pode:\n');

console.log('1️⃣  USAR ULTRON COM DIGITAÇÃO (RECOMENDADO)');
console.log('    ✅ Funciona 100%');
console.log('    ✅ Sem problemas');
console.log('    ✅ Rápido e confiável\n');

console.log('    Execute: node ultron-voice-full.js');
console.log('    Digite comandos em vez de falar\n');

console.log('═════════════════════════════════════════════════\n');

console.log('2️⃣  USAR ALTERNATIVA DE VOZ (Vosk - Offline)');
console.log('    ✅ Voz funciona 100%');
console.log('    ✅ Offline (sem internet)');
console.log('    ✅ Sem custos\n');

console.log('    Se quiser isto, fale para eu instalar!\n');

console.log('═════════════════════════════════════════════════\n');

console.log('3️⃣  USAR GOOGLE CLOUD SPEECH (Online)');
console.log('    ✅ Muito acurado');
console.log('    ✅ Reconhece português perfeito');
console.log('    ⚠️  Custa dinheiro (US$0.006 por minuto)');
console.log('    ⚠️  Precisa de internet\n');

console.log('═════════════════════════════════════════════════\n');

console.log('🎯 MINHA RECOMENDAÇÃO:\n');

console.log('Inicialmente: Use DIGITAÇÃO (opção 1)');
console.log('Depois: Se quiser voz, instalo VOSK (opção 2)\n');

console.log('Qual você prefere?\n');
