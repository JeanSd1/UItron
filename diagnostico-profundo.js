#!/usr/bin/env node

/**
 * DIAGNÓSTICO PROFUNDO - ENCONTRAR O REAL PROBLEMA DO MICROFONE
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  🔬 DIAGNÓSTICO PROFUNDO DO MICROFONE        ║');
console.log('╚════════════════════════════════════════════════╝\n');

// ===== TESTE 1: Listar TODOS os dispositivos de áudio =====
console.log('TEST 1: Dispositivos de áudio do sistema\n');

try {
  const script = `
Get-WmiObject Win32_SoundDevice | Select-Object Name, Status, Manufacturer | Format-Table -AutoSize
`;
  const result = execSync(`powershell -Command "${script}"`, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  console.log(result);
} catch (e) {
  console.log('Erro ao listar dispositivos\n');
}

// ===== TESTE 2: Verificar qual é o microfone PADRÃO =====
console.log('TEST 2: Microfone configurado como padrão\n');

try {
  const script = `
Add-Type -AssemblyName System.Speech;
$recognizers = [System.Speech.Recognition.SpeechRecognitionEngine]::InstalledRecognizers();

Write-Host "Reconhecedores disponíveis:"
foreach ($r in $recognizers) {
    Write-Host "  Nome: $($r.Name)"
    Write-Host "  Cultura: $($r.Culture.DisplayName)"
    Write-Host ""
}

$defaultRecognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine;
Write-Host "Reconhecedor ativo: $($defaultRecognizer.RecognizerInfo.Name)"
Write-Host "Cultura: $($defaultRecognizer.RecognizerInfo.Culture.DisplayName)"
`;
  const result = execSync(`powershell -Command "${script}"`, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  console.log(result);
} catch (e) {
  console.log('Erro ao verificar microfone padrão\n');
}

// ===== TESTE 3: Testar captura COM feedback visual =====
console.log('\nTEST 3: Testando captura de áudio (COM FEEDBACK)\n');
console.log('⏳ AGUARDE...\n');

try {
  const script = `
Add-Type -AssemblyName System.Speech;

Write-Host "1️⃣  Criando reconhecedor..."
$recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine;
Write-Host "   ✅ Reconhecedor criado"

Write-Host ""
Write-Host "2️⃣  Ativando microfone..."
$recognizer.SetInputToDefaultAudioDevice();
Write-Host "   ✅ Microfone ativo"

Write-Host ""
Write-Host "3️⃣  Carregando gramática de ditado..."
$grammar = New-Object System.Speech.Recognition.DictationGrammar;
$recognizer.LoadGrammar($grammar);
Write-Host "   ✅ Gramática carregada"

Write-Host ""
Write-Host "4️⃣  FALE AGORA! (20 segundos...)"
Write-Host "   Fale algo: 'olá', 'teste', qualquer coisa"
Write-Host ""

\$result = \$recognizer.Recognize(20000);

Write-Host "5️⃣  Resultado:"
if (\$result -ne \$null -and \$result.Text) {
    Write-Host "   ✅ VOZ CAPTURADA!"
    Write-Host "   Texto: '\$(\$result.Text)'"
    Write-Host "   Confiança: \$(\$result.Confidence * 100)%"
    Write-Host ""
    Write-Host "🎉 SUCESSO! Microfone está funcionando!"
} else {
    Write-Host "   ❌ Nenhuma voz capturada"
    Write-Host ""
    Write-Host "📋 Possíveis causas:"
    Write-Host "   1. Microfone está DESATIVADO nos Ajustes?"
    Write-Host "   2. Volume do microfone muito baixo?"
    Write-Host "   3. Outro programa usando o microfone?"
    Write-Host "   4. Microfone não está setado como PADRÃO?"
    Write-Host ""
    Write-Host "🔧 Próximos passos:"
    Write-Host "   1. Win + I → Configurações"
    Write-Host "   2. Vá para: Som"
    Write-Host "   3. Entrada → Microphones"
    Write-Host "   4. Verifique qual está com checkmark ✓"
}
`;

  const result = spawnSync('powershell', ['-NoProfile', '-Command', script], {
    encoding: 'utf-8',
    timeout: 30000,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  console.log(result.stdout);
  if (result.stderr) {
    console.log('STDERR:', result.stderr);
  }

} catch (e) {
  console.log('❌ Erro na captura:', e.message);
}

// ===== TESTE 4: Verificar permissões no Windows =====
console.log('\n\nTEST 4: Verificar permissões de microfone no Windows\n');

try {
  const script = `
Write-Host "Verificando configurações de privacidade..."
Write-Host ""

# Tentar acessar a chave de registro
try {
    \$regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Privacy\\Accessors"
    $reg = Get-ItemProperty -Path \$regPath -Name "MicrophoneAutoAcceptShareDefault" -ErrorAction SilentlyContinue
    
    if (\$reg) {
        Write-Host "✅ Chave de microfone encontrada"
    } else {
        Write-Host "⚠️  Chave de privacidade não configurada"
    }
} catch {
    Write-Host "ℹ️  Não foi possível verificar registro (esperado)"
}

Write-Host ""
Write-Host "Para ativar microfone:"
Write-Host "1. Win + I (Configurações)"
Write-Host "2. Privacidade e segurança"
Write-Host "3. Microfone"
Write-Host "4. Ative: 'Permitir que aplicativos acessem seu microfone'"
Write-Host "5. Ative também: Terminal e PowerShell"
`;

  const result = execSync(`powershell -Command "${script}"`, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  console.log(result);

} catch (e) {
  console.log('Erro ao verificar permissões\n');
}

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  📝 RESUMO E PRÓXIMOS PASSOS                  ║');
console.log('╚════════════════════════════════════════════════╝\n');

console.log('Se a captura funcionou acima, execute:');
console.log('  node ultron-voice-full.js\n');

console.log('Se NÃO funcionou, faça isto (em ordem):');
console.log('1️⃣  Win + I → Configurações');
console.log('   → Privacidade e segurança → Microfone');
console.log('   → Ative TODOS os toggles\n');

console.log('2️⃣  Win + I → Som');
console.log('   → Entrada avançada');
console.log('   → Selecione seu microfone e clique "Definir como padrão"\n');

console.log('3️⃣  Verifique o ícone de som no canto (tray)');
console.log('   → Certifique-se que o microfone NÃO está mutado\n');

console.log('4️⃣  Feche aplicativos que usam microfone (Discord, Teams, etc)\n');

console.log('Depois tente novamente este diagnóstico!\n');
