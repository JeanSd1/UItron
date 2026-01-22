/**
 * VOICE LISTENER - Captura com FFmpeg (Windows)
 * Arquitetura correta para Windows + Node.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let microphoneName = null;

/**
 * Detectar nome do microfone automaticamente
 */
async function detectMicrophone() {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', [
      '-list_devices', 'true',
      '-f', 'dshow',
      '-i', 'dummy'
    ]);

    let output = '';
    
    ffmpeg.stderr.on('data', (data) => {
      output += data.toString();
    });

    ffmpeg.on('close', () => {
      const lines = output.split('\n');
      for (let line of lines) {
        if (line.includes('audio=')) {
          const match = line.match(/"([^"]*(?:Microfone|Microphone|Audio)[^"]*)"/i);
          if (match) {
            resolve(match[1]);
            return;
          }
        }
      }
      resolve('Microfone (Realtek(R) Audio)');
    });
  });
}

/**
 * Gravar áudio usando FFmpeg
 */
async function recordAudio(seconds = 8) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!microphoneName) {
        microphoneName = await detectMicrophone();
      }

      const output = path.join(__dirname, 'input.wav');

      if (fs.existsSync(output)) {
        fs.unlinkSync(output);
      }

      const ffmpeg = spawn('ffmpeg', [
        '-y',
        '-f', 'dshow',
        '-i', `audio=${microphoneName}`,
        '-t', String(seconds),
        '-ac', '1',
        '-ar', '16000',
        output
      ], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      ffmpeg.stderr.on('data', () => {});
      ffmpeg.stdout.on('data', () => {});

      const timeout = setTimeout(() => {
        ffmpeg.kill();
      }, (seconds + 5) * 1000);

      ffmpeg.on('close', (code) => {
        clearTimeout(timeout);
        if (fs.existsSync(output) && fs.statSync(output).size > 0) {
          resolve(output);
        } else {
          reject(new Error('Falha ao gravar áudio'));
        }
      });

      ffmpeg.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  recordAudio,
  detectMicrophone
};

      const timeout = setTimeout(() => {
        ffmpeg.kill();
      }, (seconds + 5) * 1000);

      ffmpeg.on('close', (code) => {
        clearTimeout(timeout);
        if (fs.existsSync(output) && fs.statSync(output).size > 0) {
          resolve(output);
        } else {
          reject(new Error('Falha ao gravar áudio'));
        }
      });

      ffmpeg.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  recordAudio,
  detectMicrophone
};
  setupHotkeyListener() {
    // Production implementation would use:
    // - node-ffi + Windows API
    // - node-global-shortcut
    // - iohook
    
    // For now: framework ready with fail-open
    this.hotkey_registered = true;
  }

  /**
   * Start recording audio (called when hotkey pressed)
   */
  async startRecording() {
    if (this.is_listening) {
      return { success: false, error: 'Already recording' };
    }

    try {
      this.is_listening = true;
      this.start_time = Date.now();
      this.audio_buffer = Buffer.alloc(0);

      auditLog({
        event_type: 'voice_recording_start',
        timestamp: new Date().toISOString()
      });

      // In production: would initialize audio capture from microphone
      // For now: framework ready

      return { success: true, message: 'Recording started' };
    } catch (err) {
      this.is_listening = false;
      auditLog({
        event_type: 'voice_recording_start',
        status: 'failed',
        error: err.message
      });
      return { success: false, error: err.message };
    }
  }

  /**
   * Stop recording and return audio data
   */
  async stopRecording() {
    if (!this.is_listening) {
      return { success: false, error: 'Not recording' };
    }

    try {
      const duration_ms = Date.now() - this.start_time;

      // Validate duration (lenient for testing)
      if (duration_ms < Math.max(this.config.min_audio_duration_ms, 50)) {
        this.is_listening = false;
        auditLog({
          event_type: 'voice_recording_stop',
          status: 'failed',
          reason: 'audio_too_short',
          duration_ms
        });
        return { success: false, error: 'Audio too short' };
      }

      if (duration_ms > this.config.max_duration_seconds * 1000) {
        this.is_listening = false;
        auditLog({
          event_type: 'voice_recording_stop',
          status: 'failed',
          reason: 'audio_too_long',
          duration_ms
        });
        return { success: false, error: 'Audio too long' };
      }

      this.is_listening = false;

      auditLog({
        event_type: 'voice_recording_stop',
        status: 'success',
        duration_ms,
        audio_size_bytes: this.audio_buffer.length
      });

      // Return audio data
      return {
        success: true,
        audio: this.audio_buffer,
        duration_ms,
        sample_rate: this.config.sample_rate,
        channels: this.config.channels,
        bit_depth: this.config.bit_depth
      };
    } catch (err) {
      this.is_listening = false;
      auditLog({
        event_type: 'voice_recording_stop',
        status: 'failed',
        error: err.message
      });
      return { success: false, error: err.message };
    }
  }

  /**
   * Is currently recording?
   */
  isListening() {
    return this.is_listening;
  }

  /**
   * Get current recording duration
   */
  getCurrentDuration() {
    if (!this.is_listening) return 0;
    return Date.now() - this.start_time;
  }

  /**
   * Shutdown listener
   */
  async shutdown() {
    if (this.is_listening) {
      await this.stopRecording();
    }

    auditLog({
      event_type: 'voice_listener_shutdown',
      status: 'complete'
    });
  }
}

module.exports = VoiceListener;
