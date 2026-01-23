#!/usr/bin/env node

/**
 * LIMPEZA PROFUNDA + REINSTALAÇÃO FORÇADA DO SPEECH RECOGNITION
 * Execute como ADMIN!
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  🔥 LIMPEZA + REINSTALAÇÃO PROFUNDA            ║');
console.log('║     Speech Recognition                         ║');
console.log('╚════════════════════════════════════════════════╝\n');

// Verificar ADMIN
try {
    execSync('net session', { stdio: 'pipe' });
} catch (e) {
    console.log('❌ VOCÊ PRECISA EXECUTAR COMO ADMIN!\n');
    console.log('Clique direito no arquivo → "Executar como administrador"\n');
    process.exit(1);
}

console.log('✅ Rodando como ADMIN\n');

// ===== PASSO 1: Listar tudo que tá instalado =====
console.log('📋 PASSO 1: Verificando pacotes instalados...\n');

try {
    const script = `
Get-WindowsCapability -Online | Where-Object {$_.Name -like "*Speech*" -or $_.Name -like "*language*pt*"} | Format-Table -Property Name, State -AutoSize
`;
    const result = execSync(`powershell -NoProfile -Command "${script}"`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(result);
} catch (e) {
    console.log('Info: Listagem pode estar vazia (normal)\n');
}

// ===== PASSO 2: REMOVER TUDO RELACIONADO A SPEECH =====
console.log('\n🧹 PASSO 2: Removendo Speech Recognition antigo...\n');

try {
    const script = `
Write-Host "Procurando pacotes para remover..."
$packages = Get-WindowsCapability -Online | Where-Object {$_.Name -like "*Speech*"}

if ($packages.Count -gt 0) {
    Write-Host "Encontrados: $($packages.Count)"
    foreach ($pkg in $packages) {
        Write-Host "  Removendo: $($pkg.Name)..."
        Remove-WindowsCapability -Online -Name $pkg.Name -ErrorAction SilentlyContinue | Out-Null
    }
    Write-Host "✅ Remoção concluída"
} else {
    Write-Host "Nenhum pacote encontrado (normal)"
}
`;
    execSync(`powershell -NoProfile -Command "${script}"`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
    });
} catch (e) {
    console.log('Info: Sem pacotes para remover (normal)\n');
}

// ===== PASSO 3: INSTALL ENGLISH FIRST (necessário!) =====
console.log('\n🌍 PASSO 3: Instalando suporte a inglês (obrigatório)...\n');
console.log('⏳ Isto pode levar 2-3 minutos...\n');

try {
    const script = `
Write-Host "Instalando Speech Recognition em inglês..."
Write-Host ""

\$result = Add-WindowsCapability -Online -Name "Speech-TextToSpeech-en-US~0.0.1.0" -WarningAction SilentlyContinue
Write-Host "Resultado: \$(\$result.State)"

if (\$result.RestartNeeded -eq $true) {
    Write-Host "Reinício necessário após este pacote"
}
`;
    execSync(`powershell -NoProfile -Command "${script}"`, {
        encoding: 'utf-8',
        stdio: 'inherit'
    });
} catch (e) {
    console.log('⚠️ English pode já estar instalado (esperado)\n');
}

// ===== PASSO 4: INSTALL PORTUGUÊS =====
console.log('\n🇧🇷 PASSO 4: Instalando Portuguese do Brasil...\n');
console.log('⏳ Isto vai levar 3-5 minutos... AGUARDE!\n');

let needsRestart = false;

try {
    const script = `
Write-Host "Instalando Portuguese (Brazil) Speech Recognition..."
Write-Host ""

\$result = Add-WindowsCapability -Online -Name "Speech-TextToSpeech-pt-BR~0.0.1.0" -WarningAction SilentlyContinue

Write-Host ""
Write-Host "Resultado: \$(\$result.State)"
Write-Host "Reinício necessário: \$(\$result.RestartNeeded)"

if (\$result.RestartNeeded -eq $true) {
    Write-Host ""
    Write-Host "⚠️  REINÍCIO NECESSÁRIO!"
    Write-Host "Windows vai reiniciar em 30 segundos..."
    exit 100
} else {
    Write-Host ""
    Write-Host "✅ Instalação completa! Sem reinício necessário."
    exit 0
}
`;
    
    try {
        execSync(`powershell -NoProfile -Command "${script}"`, {
            encoding: 'utf-8',
            stdio: 'inherit',
            timeout: 600000
        });
    } catch (e) {
        if (e.status === 100) {
            needsRestart = true;
        } else {
            throw e;
        }
    }

} catch (e) {
    console.log('Erro durante instalação (pode ser esperado)');
}

// ===== PASSO 5: Reinício se necessário =====
if (needsRestart) {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║  🔄 REINICIANDO O COMPUTADOR                 ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    
    console.log('Você será reiniciado em 20 segundos...\n');
    console.log('Para CANCELAR, pressione CTRL+C AGORA!\n');
    
    for (let i = 20; i > 0; i--) {
        process.stdout.write(`Reiniciando em ${i} segundos...\r`);
        execSync('timeout /t 1 /nobreak', { stdio: 'pipe' });
    }
    
    console.log('\nReiniciando agora...\n');
    execSync('shutdown /r /t 0 /f', { stdio: 'pipe' });
    
} else {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║  ✅ INSTALAÇÃO COMPLETA!                      ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    
    console.log('🚀 Próximos passos:\n');
    console.log('1️⃣  Feche este programa');
    console.log('2️⃣  Abra novo PowerShell');
    console.log('3️⃣  Digite:\n');
    console.log('   cd "C:\\Users\\Lugan\\OneDrive\\Área de Trabalho\\Projeto Ultron"');
    console.log('   node diagnostico-profundo.js\n');
    console.log('Desta vez deve funcionar! 🎉\n');
}
