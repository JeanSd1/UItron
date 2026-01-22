#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  🔧 DIAGNÓSTICO DETALHADO DE MICROFONE       ║');
console.log('╚════════════════════════════════════════════════╝\n');

// TEST 1: Verificar reconhecedores disponíveis
console.log('📋 TEST 1: Reconhecedores instalados...\n');
try {
    const script = `
[System.Reflection.Assembly]::LoadWithPartialName('System.Speech') | Out-Null
\$recognizers = [System.Speech.Recognition.SpeechRecognitionEngine]::InstalledRecognizers()
Write-Host "Total: \$(\$recognizers.Count) reconhecedor(es)"
foreach (\$r in \$recognizers) {
    Write-Host "  - Nome: \$(\$r.Name)"
    Write-Host "    Cultura: \$(\$r.Culture.DisplayName)"
    Write-Host ""
}
`;
    const result = execSync(`powershell -c "${script.replace(/"/g, '\\"')}"`, {
        encoding: 'utf-8',
        timeout: 5000
    });
    console.log(result);
} catch (e) {
    console.log('❌ Erro ao listar reconhecedores:\n', e.message);
}

// TEST 2: Verificar microfone no Registry
console.log('🎙️  TEST 2: Verificando microfone no registro...\n');
try {
    const regQuery = execSync('reg query "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Holographic" /v "ThirdPartyAppsEnabled" 2>nul || echo "Chave não encontrada"', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log('Resultado:', regQuery.trim());
} catch (e) {
    console.log('Info: Registro não encontrado (esperado)');
}

// TEST 3: Testar captura com timeout longo
console.log('\n📢 TEST 3: Testando captura de voz (15 segundos)...\n');
console.log('⏳ FALE AGORA! Pode falar o que quiser...\n');

try {
    const script = `
[System.Reflection.Assembly]::LoadWithPartialName('System.Speech') | Out-Null

\$recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine
\$recognizer.SetInputToDefaultAudioDevice()

\$grammar = New-Object System.Speech.Recognition.DictationGrammar
\$recognizer.LoadGrammar(\$grammar)

Write-Host "🎤 ESCUTANDO (15 segundos)..."
Write-Host ""

\$result = \$recognizer.Recognize(15000)

if (\$result -ne \$null -and \$result.Text -ne "") {
    Write-Host "✅ VOZ CAPTURADA!"
    Write-Host "Confiança: \$(\$result.Confidence * 100)%"
    Write-Host "Você disse: '\$(\$result.Text)'"
    Write-Host ""
    Write-Host "🎉 MICROFONE ESTÁ FUNCIONANDO!"
    exit 0
} else {
    Write-Host "❌ Nenhuma voz capturada"
    Write-Host ""
    Write-Host "Possíveis problemas:"
    Write-Host "  1. Microfone desligado?"
    Write-Host "  2. Microfone não está setado como padrão?"
    Write-Host "  3. Volume do microfone muito baixo?"
    Write-Host "  4. Outro programa usando o microfone?"
    Write-Host ""
    exit 1
}
`;

    const result = execSync(`powershell -c "${script.replace(/"/g, '\\"')}"`, {
        encoding: 'utf-8',
        timeout: 20000,
        stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(result);
} catch (e) {
    console.log('❌ Erro na captura:', e.message.split('\n')[0]);
}

// TEST 4: Verificar permissões
console.log('\nℹ️  TEST 4: Verificando permissões de microfone...\n');
console.log('Você deu permissão para o PowerShell usar o microfone?');
console.log('  Windows 10/11: Configurações > Privacidade > Microfone');
console.log('  Verifique se o aplicativo de terminal tem acesso\n');

// TEST 5: Sugestões
console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  💡 SOLUÇÕES PARA TENTAR                      ║');
console.log('╚════════════════════════════════════════════════╝\n');

console.log('1️⃣  Verifique o microfone:');
console.log('   • Clique no ícone de som no canto (tray)');
console.log('   • Verifique se o microfone não está mutado');
console.log('   • Veja o nível de volume\n');

console.log('2️⃣  Configure microfone como padrão:');
console.log('   • Win + I → Som → Entrada avançada');
console.log('   • Selecione seu microfone e clique "Definir como padrão"\n');

console.log('3️⃣  Dê permissão ao PowerShell:');
console.log('   • Configurações > Privacidade > Microfone');
console.log('   • Ative "Permitir que os aplicativos acessem seu microfone"\n');

console.log('4️⃣  Reinicie o PowerShell e tente novamente\n');

console.log('5️⃣  Se nada funcionar, tente DIGITAR em vez de falar:');
console.log('   [ENTER para falar ou digite \'sair\'] > abra o notepad\n');
