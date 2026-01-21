/**
 * TESTE SIMPLES DE VOZ
 * Vê se consegue capturar qualquer coisa do microfone
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║   🎤 TESTE SIMPLES DE VOZ - ULTRON            ║');
console.log('╚════════════════════════════════════════════════╝\n');

console.log('📢 QUANDO VER "Fale agora..." FALE ALGO!\n');
console.log('⏱️  Você tem 5 segundos para falar.\n');

const psScript = `
[System.Reflection.Assembly]::LoadWithPartialName("System.Speech") | Out-Null;

$recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine;
$grammar = New-Object System.Speech.Recognition.DictationGrammar;
$recognizer.LoadGrammar($grammar);

$recognizer.InitialSilenceTimeout = 2000;
$recognizer.BabbleTimeout = 1000;
$recognizer.EndSilenceTimeout = 2000;

$recognizer.SetInputToDefaultAudioDevice();

Write-Output "Fale agora..."

$result = $recognizer.Recognize(5000);

if ($result -and $result.Text) {
    Write-Output $result.Text;
} else {
    Write-Output "SEM_AUDIO";
}
`;

const scriptFile = path.join(__dirname, '.teste_voz_simples.ps1');
fs.writeFileSync(scriptFile, psScript, 'utf8');

const result = spawnSync('powershell', [
  '-ExecutionPolicy', 'Bypass',
  '-NoProfile',
  '-File', scriptFile
], {
  encoding: 'utf-8',
  timeout: 10000,
  stdio: 'inherit'  // Mostra output em real-time
});

// Limpar arquivo
try {
  if (fs.existsSync(scriptFile)) {
    fs.unlinkSync(scriptFile);
  }
} catch (e) {
  // Ignorar
}

console.log('\n✅ Teste finalizado!\n');
