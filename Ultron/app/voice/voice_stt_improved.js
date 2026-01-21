/**
 * STT Melhorado - Speech-to-Text Robusto
 * Captura real do microfone com fallback
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Testar se microfone está disponível
 */
function testMicrophone() {
  try {
    const psScript = `
    Add-Type -AssemblyName System.Speech;
    \$recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine;
    \$recognizer.SetInputToDefaultAudioDevice();
    "OK"
    `;
    
    const result = execSync(`powershell -NoProfile -Command "${psScript}"`, {
      encoding: 'utf-8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    return result.trim() === 'OK';
  } catch (error) {
    return false;
  }
}

/**
 * Capturar voz usando PowerShell com abordagem melhorada
 */
async function captureVoiceImproved() {
  return new Promise((resolve) => {
    try {
      // Script PowerShell MUITO MAIS AGRESSIVO - deixa capturar POR MAIS TEMPO
      const psScript = `
      [System.Reflection.Assembly]::LoadWithPartialName("System.Speech") | Out-Null;
      
      try {
          # Criar recognizer
          \\$recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine;
          
          # Grammar: aceita qualquer coisa
          \\$grammar = New-Object System.Speech.Recognition.DictationGrammar;
          \\$recognizer.LoadGrammar(\\$grammar);
          
          # Configurar TIMEOUTS OTIMIZADOS - deixa ouvir mais tempo
          \\$recognizer.InitialSilenceTimeout = 8000;        # Espera 8s antes de começar (mais generoso)
          \\$recognizer.BabbleTimeout = 3500;               # Permite mais ruído (3.5s)
          \\$recognizer.EndSilenceTimeout = 5000;           # Espera 5s após a fala (NÃO CORTA RÁPIDO)
          \\$recognizer.EndSilenceTimeoutAmbiguous = 6000;  # Muito mais tempo para ambíguo (6s)
          
          # Usar microfone padrão
          \\$recognizer.SetInputToDefaultAudioDevice();
          
          # RECONHECER POR ATÉ 60 SEGUNDOS (muito mais tempo para falar)
          \\$result = \\$recognizer.Recognize(60000);
          
          if (\\$result -and \\$result.Text) {
              Write-Output \\$result.Text;
          } else {
              Write-Output "";
          }
      } catch {
          Write-Output "";
      }
      `;
      
      const scriptFile = path.join(__dirname, '.voice_script_improved.ps1');
      fs.writeFileSync(scriptFile, psScript, 'utf8');
      
      // Executar com timeout MUITO MAIOR para capturar tudo
      const result = spawnSync('powershell', [
        '-ExecutionPolicy', 'Bypass',
        '-NoProfile',
        '-File', scriptFile
      ], {
        encoding: 'utf-8',
        timeout: 65000,  // Aumentado para 65s - deixa o usuário falar bastante
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      // Limpar arquivo
      try {
        if (fs.existsSync(scriptFile)) {
          fs.unlinkSync(scriptFile);
        }
      } catch (e) {
        // Ignorar
      }
      
      if (result.stdout) {
        const text = result.stdout.trim();
        if (text && text.length > 0) {
          resolve(text);
          return;
        }
      }
      resolve(null);
    } catch (error) {
      resolve(null);
    }
  });
}

/**
 * Diagnóstico de voz
 */
async function voiceDiagnostics() {
  console.log('\n🔧 [DIAGNÓSTICO] Testando microfone...\n');
  
  const hasMic = testMicrophone();
  
  if (!hasMic) {
    console.log('⚠️  [AVISO] Microfone não detectado ou Windows Speech não disponível.\n');
    console.log('Soluções:\n');
    console.log('1. Verifique se o microfone está plugado e ativado');
    console.log('2. Vá em: Configurações → Som → Volume de entrada');
    console.log('3. Teste seu microfone em: Configurações → Som → Teste de microfone');
    console.log('4. Ative: Configurações → Privacidade e Segurança → Acesso ao Microfone\n');
    console.log('🔄 Por enquanto, você pode DIGITAR seus comandos no terminal!\n');
    return false;
  }
  
  console.log('✅ Microfone detectado!\n');
  return true;
}

module.exports = {
  captureVoiceImproved,
  testMicrophone,
  voiceDiagnostics
};
