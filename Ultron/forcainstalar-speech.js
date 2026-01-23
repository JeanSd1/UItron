#!/usr/bin/env node

/**
 * FORÇAR INSTALAÇÃO DO WINDOWS SPEECH RECOGNITION
 * Execute como ADMIN!
 */

const { execSync } = require('child_process');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  🔧 FORÇAR INSTALAÇÃO DO SPEECH RECOGNITION  ║');
console.log('╚════════════════════════════════════════════════╝\n');

// Verificar se está como ADMIN
try {
    execSync('net session', { stdio: 'pipe' });
} catch (e) {
    console.log('❌ ERRO: Você DEVE executar como ADMINISTRADOR!');
    console.log('\n🔑 Como executar:');
    console.log('   1. Clique direito neste arquivo');
    console.log('   2. Selecione "Executar como administrador"');
    console.log('   3. Clique "Sim" quando pedir permissão\n');
    process.exit(1);
}

console.log('✅ Rodando como ADMIN\n');

// ===== ETAPA 1: Verificar status =====
console.log('📋 ETAPA 1: Verificando status...\n');

try {
    const script = `
# Verificar pacotes instalados
Write-Host "Procurando pacotes de Speech Recognition..."
Get-WindowsCapability -Online | Where-Object {$_.Name -like "*Speech*"} | Format-Table -AutoSize
`;
    const result = execSync(`powershell -Command "${script}"`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(result);
} catch (e) {
    console.log('Erro ao verificar pacotes (não é crítico)\n');
}

// ===== ETAPA 2: Remover versão anterior =====
console.log('\n📋 ETAPA 2: Removendo versões antigas...\n');

try {
    const script = `
Write-Host "Removendo Speech Recognition antigo..."
Get-WindowsCapability -Online | Where-Object {$_.Name -like "*Speech*" -and $_.State -eq "Installed"} | Remove-WindowsCapability -Online -ErrorAction SilentlyContinue
Write-Host "✅ Limpeza concluída"
`;
    execSync(`powershell -Command "${script}"`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
    });
} catch (e) {
    console.log('Info: Nenhuma versão anterior encontrada (normal)\n');
}

// ===== ETAPA 3: FORÇAR instalação completa =====
console.log('\n📋 ETAPA 3: Instalando Speech Recognition...\n');
console.log('⏳ Isto pode levar 2-5 minutos... AGUARDE!\n');

try {
    const script = `
Write-Host "Iniciando instalação..."
$result = Add-WindowsCapability -Online -Name "Speech-TextToSpeech-pt-BR~0.0.1.0" -ErrorAction Stop
Write-Host ""
Write-Host "Resultado: $($result.RestartNeeded)"

if ($result.RestartNeeded -eq $true) {
    Write-Host ""
    Write-Host "🔄 REINÍCIO NECESSÁRIO!"
    Write-Host "Você será reiniciado em 30 segundos..."
    Write-Host ""
    Write-Host "Para PARAR o reinício, digite CTRL+C agora!"
    Write-Host ""
    Start-Sleep -Seconds 5
    Write-Host "Reiniciando em..."
    
    for ($i = 25; $i -gt 0; $i--) {
        Write-Host "$i segundos..." -NoNewline
        Start-Sleep -Seconds 1
        Write-Host "`r" -NoNewline
    }
    
    Write-Host ""
    Write-Host "Reiniciando agora..."
    Restart-Computer -Force
} else {
    Write-Host ""
    Write-Host "✅ Instalação completa SEM reinício"
    Write-Host "✅ Speech Recognition pronto!"
}
`;
    
    execSync(`powershell -Command "${script}"`, {
        encoding: 'utf-8',
        stdio: 'inherit',
        timeout: 600000 // 10 minutos
    });

} catch (e) {
    if (e.message.includes('RESTART_REQUIRED')) {
        console.log('🔄 Reinício necessário! Sistema vai reiniciar...\n');
    } else {
        console.log('Erro durante instalação:', e.message);
    }
}

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  ✅ ETAPAS CONCLUÍDAS                         ║');
console.log('╚════════════════════════════════════════════════╝\n');

console.log('Próximos passos:\n');
console.log('1️⃣  Se o sistema reiniciou, aguarde e log in novamente');
console.log('2️⃣  Abra o PowerShell');
console.log('3️⃣  Rode: node diagnostico-profundo.js');
console.log('4️⃣  Desta vez deve funcionar! 🎉\n');
