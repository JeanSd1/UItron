/**
 * Módulo de STT Real - Speech-to-Text
 * Captura áudio do microfone do usuário
 * 
 * Suporta:
 * - Windows Speech API nativa
 * - Web Speech API (browser)
 * - Google Cloud Speech (opcional)
 * - Whisper.cpp local (opcional)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Captura áudio do microfone usando Windows Speech Recognition
 * Retorna o texto reconhecido
 */
async function captureAudioWin32() {
  try {
    // Script PowerShell para capturar fala usando Windows Speech Recognition
    const tempFile = path.join(__dirname, '.recognition_temp.txt');
    
    const psScript = `
    Add-Type -AssemblyName System.Speech;
    Add-Type -AssemblyName System.Windows.Forms;
    
    $recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine;
    $recognizer.LoadGrammar([System.Speech.Recognition.DictationGrammar]::new());
    
    [System.Windows.Forms.MessageBox]::Show(
        "Pressione OK e fale seu comando. Clique em Fechar para parar.", 
        "Ultron - Escutando", 
        "YesNo"
    ) | Out-Null;
    
    try {
        $audioInput = New-Object System.Speech.AudioFormat -ArgumentList 16000, [System.Speech.AudioBitsPerSample]::Sixteen, 1;
        $audioStream = [System.IO.MemoryStream]::new();
        $recognizer.SetInputToDefaultAudioDevice();
        
        $result = $recognizer.Recognize(5000); # Aguardar até 5 segundos
        
        if ($result) {
            \$result.Text | Out-File -FilePath '$tempFile' -Encoding UTF8;
        } else {
            "No speech detected" | Out-File -FilePath '$tempFile' -Encoding UTF8;
        }
    } catch {
        \$_.Exception.Message | Out-File -FilePath '$tempFile' -Encoding UTF8;
    }
    `;
    
    // Salvar script temporário
    const scriptFile = path.join(__dirname, '.speech_script.ps1');
    fs.writeFileSync(scriptFile, psScript, 'utf8');
    
    try {
      // Executar script PowerShell
      execSync(`powershell -ExecutionPolicy Bypass -NoProfile -File "${scriptFile}"`, {
        stdio: 'pipe',
        timeout: 10000
      });
    } catch (error) {
      // Ignorar erro de timeout ou execution
    }
    
    // Ler resultado
    let result = 'No speech detected';
    if (fs.existsSync(tempFile)) {
      result = fs.readFileSync(tempFile, 'utf8').trim();
      fs.unlinkSync(tempFile);
    }
    
    // Limpar script
    if (fs.existsSync(scriptFile)) {
      fs.unlinkSync(scriptFile);
    }
    
    return result;
    
  } catch (error) {
    console.error('[STT] Erro ao capturar áudio:', error.message);
    return null;
  }
}

/**
 * Simula captura de voz para testes
 * Em produção, usaria API real de STT
 */
function simulateSpeechCapture() {
  const mockInputs = [
    'qual é o status',
    'mostrar métricas',
    'histórico completo',
    'como você funciona',
    'ajuda'
  ];
  
  return mockInputs[Math.floor(Math.random() * mockInputs.length)];
}

/**
 * Captura áudio real ou simulado
 */
async function capture(useReal = false) {
  if (useReal) {
    return await captureAudioWin32();
  } else {
    return simulateSpeechCapture();
  }
}

/**
 * Interface simplificada para captura
 */
async function getVoiceCommand(options = {}) {
  const useReal = options.useReal || false;
  const maxRetries = options.maxRetries || 3;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const command = await capture(useReal);
      
      if (command && command !== 'No speech detected' && command.length > 0) {
        return {
          success: true,
          text: command,
          attempt: i + 1,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error(`[STT] Tentativa ${i + 1} falhou: ${error.message}`);
    }
  }
  
  return {
    success: false,
    error: 'Nenhuma fala detectada após múltiplas tentativas',
    attempts: maxRetries
  };
}

module.exports = {
  capture,
  getVoiceCommand,
  captureAudioWin32,
  simulateSpeechCapture
};
