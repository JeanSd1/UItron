/**
 * PASSO 5.1.1 — Voice Listener (Push-to-Talk)
 * 
 * Read-Only Voice Input
 * No continuous listening
 * No auto-execution
 * Audit-grade logging
 */

const fs = require('fs');
const path = require('path');
const { auditLog } = require('./voice_logger');

class VoiceListener {
  constructor(config = {}) {
    this.config = {
      hotkey: config.hotkey || 'CTRL+SHIFT+V',
      max_duration_seconds: config.max_duration_seconds || 30,
      silence_threshold_ms: config.silence_threshold_ms || 1500,
      min_audio_duration_ms: config.min_audio_duration_ms || 500,
      sample_rate: 16000,
      channels: 1,
      bit_depth: 16
    };

    this.is_listening = false;
    this.audio_buffer = null;
    this.start_time = null;
  }

  /**
   * Initialize push-to-talk listener
   */
  async initialize() {
    try {
      auditLog({
        event_type: 'voice_listener_init',
        status: 'initializing',
        hotkey: this.config.hotkey
      });

      // In production: would use native OS APIs (Win32 API for Windows)
      // For now: simulation + framework ready
      this.setupHotkeyListener();

      auditLog({
        event_type: 'voice_listener_init',
        status: 'ready',
        message: `Listening for hotkey: ${this.config.hotkey}`
      });

      return { success: true, message: 'Voice listener ready' };
    } catch (err) {
      auditLog({
        event_type: 'voice_listener_init',
        status: 'failed',
        error: err.message
      });
      return { success: false, error: err.message };
    }
  }

  /**
   * Setup hotkey listener (framework only)
   */
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
