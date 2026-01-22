/**
 * ULTRON - DIAGNÓSTICO E AUTO-REPARO DE VOZ
 * Detecta e corrige problemas de Speech Recognition
 */

const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║   🔧 DIAGNÓSTICO E AUTO-REPARO - ULTRON VOZ             ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

let allGood = true;

// ==================== CHECK 1: PowerShell ====================
console.log('📊 CHECK 1: PowerShell disponível?');

try {
  const ps = spawnSync('powershell', ['-Command', 'Write-Output OK'], {
    timeout: 5000,
    encoding: 'utf-8'
  });
  
  if (ps.stdout.includes('OK')) {
    console.log('✅ PowerShell funcionando\n');
  } else {
    console.log('❌ PowerShell não respondeu\n');
    allGood = false;
  }
} catch (e) {
  console.log('❌ PowerShell erro:', e.message, '\n');
  allGood = false;
}

// ==================== CHECK 2: .NET Assembly ====================
console.log('📊 CHECK 2: System.Speech Assembly pode carregar?');

const checkAssembly = `
try {
    [System.Reflection.Assembly]::LoadWithPartialName("System.Speech") | Out-Null;
    Write-Output "OK"
} catch {
    Write-Output "FAIL: \$_"
}
`;

try {
  const result = spawnSync('powershell', ['-Command', checkAssembly], {
    timeout: 5000,
    encoding: 'utf-8'
  });
  
  if (result.stdout.includes('OK')) {
    console.log('✅ System.Speech Assembly carregado\n');
  } else {
    console.log('❌ System.Speech não carregou:', result.stdout.trim(), '\n');
    allGood = false;
  }
} catch (e) {
  console.log('❌ Erro ao testar assembly:', e.message, '\n');
  allGood = false;
}

// ==================== CHECK 3: Microphone Permission ====================
console.log('📊 CHECK 3: Permissão de microfone no Windows?');

const checkMicPerm = `
$regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\microphone"
$adminPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\microphone\\User"

if (Test-Path $regPath) {
    Write-Output "REG_EXISTS"
} else {
    Write-Output "REG_MISSING"
}
`;

try {
  const result = spawnSync('powershell', ['-Command', checkMicPerm], {
    timeout: 5000,
    encoding: 'utf-8'
  });
  
  console.log('⚠️  Resultado:', result.stdout.trim());
  console.log('   Você PRECISA dar permissão manual em:');
  console.log('   Configurações > Privacidade > Microfone > Permitido\n');
} catch (e) {
  console.log('❌ Erro ao verificar permissões\n');
}

// ==================== CHECK 4: Try Actual Recognition ====================
console.log('📊 CHECK 4: Tentar reconhecer áudio por 3 segundos...');
console.log('   ⚠️  FALE ALGO AGORA!\n');

const tryRecognize = `
[System.Reflection.Assembly]::LoadWithPartialName("System.Speech") | Out-Null;

try {
    $recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine;
    $grammar = New-Object System.Speech.Recognition.DictationGrammar;
    $recognizer.LoadGrammar($grammar);
    
    $recognizer.InitialSilenceTimeout = 2000;
    $recognizer.BabbleTimeout = 1000;
    $recognizer.EndSilenceTimeout = 2000;
    
    $recognizer.SetInputToDefaultAudioDevice();
    $result = $recognizer.Recognize(3000);
    
    if ($result -and $result.Text) {
        Write-Output "CAPTURED: \$(\$result.Text)"
    } else {
        Write-Output "NO_AUDIO"
    }
} catch {
    Write-Output "ERROR: \$_"
}
`;

try {
  const result = spawnSync('powershell', ['-Command', tryRecognize], {
    timeout: 10000,
    encoding: 'utf-8'
  });
  
  const output = result.stdout.trim();
  
  if (output.includes('CAPTURED')) {
    console.log('✅ Áudio capturado com sucesso!');
    console.log('   Output:', output, '\n');
  } else if (output.includes('NO_AUDIO')) {
    console.log('⚠️  Nenhum áudio detectado');
    console.log('   Possível causa: Microfone muito baixo ou sem permissão\n');
    allGood = false;
  } else if (output.includes('ERROR')) {
    console.log('❌ Erro:', output.trim());
    console.log('   Provável causa: Windows Speech Recognition não instalado\n');
    allGood = false;
  }
} catch (e) {
  console.log('❌ Exception:', e.message, '\n');
  allGood = false;
}

// ==================== RESULTADO FINAL ====================
console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                    RESULTADO                            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

if (allGood) {
  console.log('✅ TUDO ESTÁ BEM! Ultron deve funcionar!\n');
  console.log('Próximo passo: node ultron-voice-full.js\n');
} else {
  console.log('❌ PROBLEMA ENCONTRADO - Possíveis soluções:\n');
  console.log('OPÇÃO 1 - Windows Speech Recognition não instalado:');
  console.log('  1. Abra PowerShell como ADMIN');
  console.log('  2. Cole: Add-WindowsCapability -Online -Name "Speech-TextToSpeech-pt-BR~0.0.1.0"');
  console.log('  3. Reinicie o computador\n');
  
  console.log('OPÇÃO 2 - Sem permissão de microfone:');
  console.log('  1. Vá em Configurações > Privacidade > Microfone');
  console.log('  2. Ligue "Permitir acesso ao microfone"');
  console.log('  3. Procure por PowerShell e marque como permitido\n');
  
  console.log('OPÇÃO 3 - Microfone desligado/mutilizado:');
  console.log('  1. Verifique se o microfone está plugado');
  console.log('  2. Verifique volume em Configurações > Som > Entrada');
  console.log('  3. Aumente o volume do microfone para 70%+\n');
  
  console.log('OPÇÃO 4 - Drivers desatualizados:');
  console.log('  1. Procure por atualizações de drivers no Gerenciador de Dispositivos');
  console.log('  2. Procure por "Controladores de som, vídeo e jogo"');
  console.log('  3. Atualize drivers do áudio\n');
}

console.log('═══════════════════════════════════════════════════════════\n');
