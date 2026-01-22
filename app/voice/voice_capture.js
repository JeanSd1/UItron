/**
 * VOICE CAPTURE - FFmpeg + Vosk
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let microphoneName = 'Microfone (Realtek(R) Audio)';
let vosk = null;
let model = null;

try {
  vosk = require('vosk');
  const modelPath = path.join(__dirname, '../../vosk_model');
  if (fs.existsSync(modelPath)) {
    model = new vosk.Model(modelPath);
  }
} catch (e) {}

/**
 * Detectar microfone
 */
async function detectMicrophone() {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', ['-list_devices', 'true', '-f', 'dshow', '-i', 'dummy']);
    let output = '';
    
    ffmpeg.stderr.on('data', (data) => { output += data.toString(); });
    ffmpeg.on('close', () => {
      const match = output.match(/"([^"]*(?:Microfone|Microphone)[^"]*)"/i);
      resolve(match ? match[1] : 'Microfone (Realtek(R) Audio)');
    });
  });
}

/**
 * Gravar com FFmpeg
 */
async function recordAudio(seconds = 8) {
  return new Promise((resolve) => {
    const wav = path.join(__dirname, 'input.wav');
    if (fs.existsSync(wav)) fs.unlinkSync(wav);

    const ffmpeg = spawn('ffmpeg', [
      '-y', '-f', 'dshow', '-i', `audio=${microphoneName}`,
      '-t', String(seconds), '-ac', '1', '-ar', '16000', wav
    ], { stdio: ['pipe', 'pipe', 'pipe'] });

    const timeout = setTimeout(() => ffmpeg.kill(), (seconds + 3) * 1000);
    ffmpeg.on('close', () => {
      clearTimeout(timeout);
      resolve(fs.existsSync(wav) && fs.statSync(wav).size > 0 ? wav : null);
    });
  });
}

/**
 * Transcrever com Vosk
 */
async function transcribeAudio(wavPath) {
  return new Promise((resolve) => {
    try {
      if (!model || !wavPath || !fs.existsSync(wavPath)) {
        resolve('');
        return;
      }
      const wf = fs.readFileSync(wavPath);
      const rec = new vosk.Recognizer({ model, sampleRate: 16000 });
      rec.acceptWaveform(wf);
      const result = rec.finalResult();
      rec.free();
      const text = result.result ? result.result.map(r => r.result).join(' ').trim() : '';
      resolve(text);
    } catch (e) {
      resolve('');
    }
  });
}

module.exports = {
  recordAudio,
  transcribeAudio,
  detectMicrophone,
  setMicrophoneName: (name) => { microphoneName = name; }
};
