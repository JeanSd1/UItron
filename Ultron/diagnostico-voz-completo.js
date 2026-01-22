/**
 * DIAGNÓSTICO COMPLETO DE VOZ
 * Verifica cada parte do sistema
 */

const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║   🔍 DIAGNÓSTICO COMPLETO DE VOZ - ULTRON     ║');
console.log('╚════════════════════════════════════════════════╝\n');

// ==================== TESTE 1: PowerShell Funciona ====================
console.log('📊 TESTE 1: PowerShell disponível?\n');
try {
  const testPS = spawnSync('powershell', ['-Command', 'Write-Output OK'], {
    encoding: 'utf-8',
    timeout: 5000
  });
  
  if (testPS.stdout.includes('OK')) {
    console.log('✅ PowerShell funcionando\n');
  } else {
    console.log('❌ PowerShell NÃO está respondendo\n');
  }
} catch (e) {
  console.log('❌ PowerShell ERROR:', e.message, '\n');
}

// ==================== TESTE 2: Assembly Speech Carrega ====================
console.log('📊 TESTE 2: System.Speech.Recognition disponível?\n');

const psScript1 = `
try {
    [System.Reflection.Assembly]::LoadWithPartialName("System.Speech") | Out-Null;
    Write-Output "ASSEMBLY_OK"
} catch {
    Write-Output "ASSEMBLY_FAILED"
}
`;

try {
  const result = spawnSync('powershell', ['-Command', psScript1], {
    encoding: 'utf-8',
    timeout: 5000,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  if (result.stdout.includes('ASSEMBLY_OK')) {
    console.log('✅ System.Speech carregado com sucesso\n');
  } else {
    console.log('❌ System.Speech NÃO carregou:', result.stdout.trim(), '\n');
  }
} catch (e) {
  console.log('❌ Erro ao carregar System.Speech:', e.message, '\n');
}

// ==================== TESTE 3: SpeechRecognitionEngine Cria ====================
console.log('📊 TESTE 3: SpeechRecognitionEngine pode criar?\n');

const psScript2 = `
try {
    [System.Reflection.Assembly]::LoadWithPartialName("System.Speech") | Out-Null;
    \\$recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine;
    Write-Output "ENGINE_OK"
} catch {
    Write-Output "ENGINE_FAILED: \\$_"
}
`;

try {
  const result = spawnSync('powershell', ['-Command', psScript2], {
    encoding: 'utf-8',
    timeout: 5000,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  if (result.stdout.includes('ENGINE_OK')) {
    console.log('✅ SpeechRecognitionEngine criado com sucesso\n');
  } else {
    console.log('❌ Erro ao criar engine:', result.stdout.trim(), '\n');
  }
} catch (e) {
  console.log('❌ Exception criando engine:', e.message, '\n');
}

// ==================== TESTE 4: Acessar Microfone Padrão ====================
console.log('📊 TESTE 4: Microfone padrão acessível?\n');

const psScript3 = `
try {
    [System.Reflection.Assembly]::LoadWithPartialName("System.Speech") | Out-Null;
    \\$recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine;
    \\$recognizer.SetInputToDefaultAudioDevice();
    Write-Output "AUDIO_DEVICE_OK"
} catch {
    Write-Output "AUDIO_DEVICE_FAILED: \\$_"
}
`;

try {
  const result = spawnSync('powershell', ['-Command', psScript3], {
    encoding: 'utf-8',
    timeout: 5000,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  if (result.stdout.includes('AUDIO_DEVICE_OK')) {
    console.log('✅ Microfone acessado com sucesso\n');
  } else {
    console.log('❌ Problema ao acessar microfone:', result.stdout.trim(), '\n');
  }
} catch (e) {
  console.log('❌ Exception ao acessar microfone:', e.message, '\n');
}

// ==================== TESTE 5: Tentar Reconhecer 3 Segundos ====================
console.log('📊 TESTE 5: Reconhecer áudio por 3 segundos?\n');
console.log('   ⚠️  FALE ALGO AGORA para este teste!\n');

const psScript4 = `
[System.Reflection.Assembly]::LoadWithPartialName("System.Speech") | Out-Null;

\\$recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine;
\\$grammar = New-Object System.Speech.Recognition.DictationGrammar;
\\$recognizer.LoadGrammar(\\$grammar);

\\$recognizer.InitialSilenceTimeout = 2000;
\\$recognizer.BabbleTimeout = 1000;
\\$recognizer.EndSilenceTimeout = 1500;

\\$recognizer.SetInputToDefaultAudioDevice();

try {
    \\$result = \\$recognizer.Recognize(3000);
    if (\\$result) {
        Write-Output "AUDIO_CAPTURED: \\$( \\$result.Text)"
    } else {
        Write-Output "NO_AUDIO_DETECTED"
    }
} catch {
    Write-Output "RECOGNITION_ERROR: \\$_"
}
`;

try {
  const result = spawnSync('powershell', ['-Command', psScript4], {
    encoding: 'utf-8',
    timeout: 10000,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  console.log('Output:', result.stdout.trim());
  
  if (result.stdout.includes('AUDIO_CAPTURED')) {
    console.log('✅ Áudio capturado com sucesso!\n');
  } else if (result.stdout.includes('NO_AUDIO_DETECTED')) {
    console.log('⚠️  Nenhum áudio detectado - fale mais perto do microfone\n');
  } else if (result.stdout.includes('RECOGNITION_ERROR')) {
    console.log('❌ Erro de reconhecimento:\n', result.stdout.trim(), '\n');
  } else {
    console.log('❌ Resposta inesperada:', result.stdout.trim(), '\n');
  }
} catch (e) {
  console.log('❌ Exception no reconhecimento:', e.message, '\n');
}

// ==================== TESTE 6: Verificar Permissões Windows ====================
console.log('📊 TESTE 6: Permissões de Microfone (Windows 10/11)?\n');

const psScript5 = `
\\$regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\microphone"
if (Test-Path \\$regPath) {
    \\$value = Get-ItemProperty \\$regPath -Name "Value" -ErrorAction SilentlyContinue
    Write-Output "REG_PATH_EXISTS"
} else {
    Write-Output "REG_PATH_NOT_FOUND"
}
`;

try {
  const result = spawnSync('powershell', ['-Command', psScript5], {
    encoding: 'utf-8',
    timeout: 5000,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  if (result.stdout.includes('REG_PATH_EXISTS')) {
    console.log('✅ Registro de permissões encontrado\n');
  } else {
    console.log('⚠️  Registro de permissões não encontrado\n');
  }
} catch (e) {
  console.log('⚠️  Não conseguiu verificar registro:', e.message, '\n');
}

// ==================== RESUMO FINAL ====================
console.log('\n╔════════════════════════════════════════════════╗');
console.log('║           PRÓXIMOS PASSOS                      ║');
console.log('╚════════════════════════════════════════════════╝\n');

console.log('Se todos os testes passaram (✅):');
console.log('  → Execute: node ultron-voice-full.js');
console.log('  → Fale algo quando pedir\n');

console.log('Se algum teste falhou (❌):');
console.log('  → Execute estes comandos no PowerShell como ADMIN:\n');
console.log('  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser\n');
console.log('  → Reinicie o computador\n');
console.log('  → Verifique Configurações > Som > Microfone está PERMITIDO\n');

console.log('Se ainda não funcionar:');
console.log('  → Tente atualizar drivers do microfone');
console.log('  → Use outro microfone para testar\n');
