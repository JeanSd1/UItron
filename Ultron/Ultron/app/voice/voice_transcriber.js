/**
 * PASSO 5.1.1 — Voice Transcriber (STT)
 * 
 * Speech-to-Text with Offline-First + Fallback
 * Hybrid: Local Whisper + API fallback
 * Deterministic, fail-open
 */

const fs = require('fs');
const path = require('path');
const { auditLog } = require('./voice_logger');

class VoiceTranscriber {
  constructor(config = {}) {
    this.config = {
      offline_engine: config.offline_engine || 'whisper-local',
      offline_model: config.offline_model || 'base',
      language: config.language || 'pt-BR',
      fallback_enabled: config.fallback_enabled || true,
      offline_timeout_ms: config.offline_timeout_ms || 30000,
      fallback_timeout_ms: config.fallback_timeout_ms || 15000
    };

    this.offline_available = false;
    this.fallback_available = false;
  }

  /**
   * Initialize transcriber (check local engine availability)
   */
  async initialize() {
    try {
      auditLog({
        event_type: 'transcriber_init',
        status: 'checking',
        offline_engine: this.config.offline_engine
      });

      // Check offline availability
      const offlineOk = await this.checkOfflineAvailability();
      this.offline_available = offlineOk;

      // Check fallback availability
      const fallbackOk = await this.checkFallbackAvailability();
      this.fallback_available = fallbackOk;

      auditLog({
        event_type: 'transcriber_init',
        status: 'ready',
        offline_available: this.offline_available,
        fallback_available: this.fallback_available
      });

      if (!this.offline_available && !this.fallback_available) {
        auditLog({
          event_type: 'transcriber_init',
          status: 'degraded',
          message: 'No STT engine available'
        });
      }

      return {
        success: this.offline_available || this.fallback_available,
        offline_available: this.offline_available,
        fallback_available: this.fallback_available
      };
    } catch (err) {
      auditLog({
        event_type: 'transcriber_init',
        status: 'failed',
        error: err.message
      });
      return { success: false, error: err.message };
    }
  }

  /**
   * Check if offline engine is available
   */
  async checkOfflineAvailability() {
    try {
      // In production: try to load whisper-cli or similar
      // For now: framework ready with fail-open
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if fallback engine is available
   */
  async checkFallbackAvailability() {
    try {
      // In production: test API key availability (OpenAI Whisper, etc.)
      // For now: framework ready
      const apiKey = process.env.OPENAI_API_KEY;
      return Boolean(apiKey);
    } catch {
      return false;
    }
  }

  /**
   * Transcribe audio offline first, fallback to API
   */
  async transcribe(audioData) {
    const start_time = Date.now();

    try {
      // Try offline first
      if (this.offline_available) {
        auditLog({
          event_type: 'transcription_attempt',
          method: 'offline',
          engine: this.config.offline_engine
        });

        const result = await this.transcribeOffline(audioData);
        
        if (result.success) {
          auditLog({
            event_type: 'transcription_success',
            method: 'offline',
            text: result.text,
            confidence: result.confidence,
            processing_time_ms: Date.now() - start_time
          });

          return result;
        }

        auditLog({
          event_type: 'transcription_offline_failed',
          error: result.error
        });
      }

      // Fallback to API if configured and offline failed
      if (this.fallback_available && this.config.fallback_enabled) {
        auditLog({
          event_type: 'transcription_attempt',
          method: 'fallback_api'
        });

        const result = await this.transcribeFallback(audioData);

        if (result.success) {
          auditLog({
            event_type: 'transcription_success',
            method: 'fallback_api',
            text: result.text,
            confidence: result.confidence,
            processing_time_ms: Date.now() - start_time
          });

          return result;
        }

        auditLog({
          event_type: 'transcription_fallback_failed',
          error: result.error
        });
      }

      // Fail-open: no transcription available
      auditLog({
        event_type: 'transcription_failed',
        status: 'all_methods_failed',
        processing_time_ms: Date.now() - start_time
      });

      return {
        success: false,
        error: 'No transcription method available',
        text: null,
        confidence: 0
      };
    } catch (err) {
      auditLog({
        event_type: 'transcription_error',
        error: err.message,
        processing_time_ms: Date.now() - start_time
      });

      return {
        success: false,
        error: err.message,
        text: null,
        confidence: 0
      };
    }
  }

  /**
   * Transcribe using local offline engine
   */
  async transcribeOffline(audioData) {
    try {
      // Simulation: in production would call whisper CLI
      // For framework: return mock result with proper structure
      
      // Mock implementation for testing
      const mockTranscriptions = {
        'qual é o estado do sistema': {
          text: 'qual é o estado do sistema',
          confidence: 0.95
        },
        'qual estado sistema': {
          text: 'qual é o estado do sistema',
          confidence: 0.92
        },
        'métricas': {
          text: 'métricas',
          confidence: 0.98
        },
        'status': {
          text: 'status',
          confidence: 0.99
        }
      };

      // In production: process audioData with whisper
      const text = Object.keys(mockTranscriptions)[0];
      const result = mockTranscriptions[text] || {
        text: 'unrecognized',
        confidence: 0.0
      };

      // Validate confidence threshold
      if (result.confidence < 0.5) {
        return {
          success: false,
          error: 'Low confidence',
          text: result.text,
          confidence: result.confidence
        };
      }

      return {
        success: true,
        text: result.text,
        confidence: result.confidence,
        method: 'offline'
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Transcribe using fallback API
   */
  async transcribeFallback(audioData) {
    try {
      // In production: call OpenAI Whisper API or similar
      // For now: framework ready

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return {
          success: false,
          error: 'API key not configured'
        };
      }

      // Placeholder: would make actual API call here
      return {
        success: true,
        text: 'transcription from api',
        confidence: 0.97,
        method: 'api'
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Normalize and clean transcription
   */
  normalizeTranscription(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ');
  }
}

module.exports = VoiceTranscriber;
