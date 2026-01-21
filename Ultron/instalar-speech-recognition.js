/**
 * INSTALAR SPEECH RECOGNITION NO WINDOWS 10/11
 * Execute como ADMIN
 */

const { spawnSync, execSync } = require('child_process');
const os = require('os');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║   🎤 INSTALAR SPEECH RECOGNITION - WINDOWS               ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('⚠️  Este script precisa ser executado como ADMINISTRADOR!\n');

// Verificar se é admin
try {
  const admin = execSync('net session 2>&1', { stdio: 'pipe', encoding: 'utf-8' });
  console.log('✅ Rodando como Administrador\n');
} catch (e) {
  console.log('❌ NÃO está rodando como Administrador!\n');
  console.log('📋 SOLUÇÃO:\n');
  console.log('1. Abra PowerShell como ADMINISTRADOR');
  console.log('2. Navegue para: C:\\Users\\Lugan\\OneDrive\\Área de Trabalho\\Projeto Ultron\\Ultron');
  console.log('3. Execute: node instalar-speech-recognition.js\n');
  process.exit(1);
}

// Detectar Windows 10 ou 11
const releaseId = require('child_process').execSync('wmic os get caption', { encoding: 'utf-8' }).toString();
console.log('📊 Seu Windows:', releaseId.trim().split('\n')[1], '\n');

console.log('🔧 Instalando Speech Recognition...\n');

// Comando 1: Verificar se está instalado
console.log('1️⃣  Verificando se Speech Recognition já está instalado...\n');

const checkCmd = `Get-WindowsCapability -Online | Where-Object { $_.Name -like '*Speech-TextToSpeech*' -or $_.Name -like '*Speech*' }`;

try {
  const check = spawnSync('powershell', ['-NoProfile', '-Command', checkCmd], {
    encoding: 'utf-8',
    timeout: 10000
  });
  
  console.log('Resultado:\n', check.stdout);
} catch (e) {
  console.log('Erro ao verificar:', e.message);
}

// Comando 2: Adicionar Speech Recognition em Português
console.log('\n2️⃣  Instalando Speech-TextToSpeech para Português (pt-BR)...\n');

const installCmd = `
Add-WindowsCapability -Online -Name "Speech-TextToSpeech-pt-BR~0.0.1.0" -WarningAction Ignore
`;

try {
  const install = spawnSync('powershell', ['-NoProfile', '-Command', installCmd], {
    encoding: 'utf-8',
    timeout: 120000,  // Pode levar tempo
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  if (install.status === 0) {
    console.log('✅ Instalado com sucesso!\n', install.stdout);
  } else {
    console.log('⚠️  Status:', install.status);
    console.log('Output:', install.stdout);
    console.log('Erro:', install.stderr);
  }
} catch (e) {
  console.log('❌ Erro durante instalação:', e.message);
}

// Comando 3: Verificar Speech Recognition Engine
console.log('\n3️⃣  Verificando se o engine está disponível...\n');

const testEngineCmd = `
[System.Reflection.Assembly]::LoadWithPartialName("System.Speech") | Out-Null;
$recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine;
if ($recognizer) {
    Write-Output "✅ Speech Recognition Engine está disponível!"
} else {
    Write-Output "❌ Engine não disponível"
}
`;

try {
  const test = spawnSync('powershell', ['-NoProfile', '-Command', testEngineCmd], {
    encoding: 'utf-8',
    timeout: 5000
  });
  
  console.log(test.stdout);
} catch (e) {
  console.log('❌ Erro ao testar:', e.message);
}

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                  PRÓXIMOS PASSOS                         ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('1. Se tudo passou ✅:');
console.log('   → Reinicie o computador');
console.log('   → Execute: node ultron-voice-full.js\n');

console.log('2. Se ainda não funcionar:');
console.log('   → Verifique Configurações > Som > Microfone está PERMITIDO');
console.log('   → Atualize drivers do microfone');
console.log('   → Use outro microfone para testar\n');
