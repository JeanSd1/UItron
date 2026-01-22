/**
 * PASSO 5.1.1 — Voice Responder (TTS)
 * 
 * Text-to-Speech with Offline-First + Fallback
 * Hybrid: Windows TTS + Piper fallback
 * Natural, neutral, audit-grade
 */

const fs = require('fs');
const path = require('path');
const { auditLog } = require('./voice_logger');

class VoiceResponder {
  constructor(config = {}) {
    this.config = {
      offline_engine: config.offline_engine || 'windows-tts',
      fallback_engine: config.fallback_engine || 'piper-tts',
      voice: config.voice || 'neutral',
      rate: config.rate || 1.0,
      pitch: config.pitch || 1.0,
      offline_timeout_ms: config.offline_timeout_ms || 10000,
      fallback_timeout_ms: config.fallback_timeout_ms || 15000
    };

    this.offline_available = false;
    this.fallback_available = false;
  }

  /**
   * Initialize responder (check TTS engine availability)
   */
  async initialize() {
    try {
      auditLog({
        event_type: 'responder_init',
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
        event_type: 'responder_init',
        status: 'ready',
        offline_available: this.offline_available,
        fallback_available: this.fallback_available
      });

      return {
        success: this.offline_available || this.fallback_available,
        offline_available: this.offline_available,
        fallback_available: this.fallback_available
      };
    } catch (err) {
      auditLog({
        event_type: 'responder_init',
        status: 'failed',
        error: err.message
      });
      return { success: false, error: err.message };
    }
  }

  /**
   * Check if offline TTS engine is available
   */
  async checkOfflineAvailability() {
    try {
      // In production: check Windows TTS availability
      // For now: framework ready
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if fallback TTS engine is available
   */
  async checkFallbackAvailability() {
    try {
      // In production: check Piper installation
      // For now: framework ready
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate speech from text (offline-first)
   */
  async synthesize(text, options = {}) {
    const start_time = Date.now();

    try {
      // Validate input
      if (!text || text.trim().length === 0) {
        auditLog({
          event_type: 'synthesis_failed',
          reason: 'empty_text',
          processing_time_ms: Date.now() - start_time
        });

        return {
          success: false,
          error: 'Empty text',
          audio: null
        };
      }

      // Try offline first
      if (this.offline_available) {
        auditLog({
          event_type: 'synthesis_attempt',
          method: 'offline',
          engine: this.config.offline_engine,
          text_length: text.length
        });

        const result = await this.synthesizeOffline(text, options);

        if (result.success) {
          auditLog({
            event_type: 'synthesis_success',
            method: 'offline',
            text_length: text.length,
            audio_duration_ms: result.duration_ms,
            processing_time_ms: Date.now() - start_time
          });

          return result;
        }

        auditLog({
          event_type: 'synthesis_offline_failed',
          error: result.error
        });
      }

      // Fallback to alternative engine if configured
      if (this.fallback_available) {
        auditLog({
          event_type: 'synthesis_attempt',
          method: 'fallback',
          engine: this.config.fallback_engine
        });

        const result = await this.synthesizeFallback(text, options);

        if (result.success) {
          auditLog({
            event_type: 'synthesis_success',
            method: 'fallback',
            audio_duration_ms: result.duration_ms,
            processing_time_ms: Date.now() - start_time
          });

          return result;
        }

        auditLog({
          event_type: 'synthesis_fallback_failed',
          error: result.error
        });
      }

      // Fail-open: no TTS available
      auditLog({
        event_type: 'synthesis_failed',
        status: 'all_methods_failed',
        processing_time_ms: Date.now() - start_time
      });

      return {
        success: false,
        error: 'No TTS method available',
        audio: null
      };
    } catch (err) {
      auditLog({
        event_type: 'synthesis_error',
        error: err.message,
        processing_time_ms: Date.now() - start_time
      });

      return {
        success: false,
        error: err.message,
        audio: null
      };
    }
  }

  /**
   * Synthesize offline using Windows TTS or similar
   */
  async synthesizeOffline(text, options = {}) {
    try {
      // In production: call Windows SAPI via PowerShell or node-edge-js
      // For now: mock implementation

      const cleanText = text
        .replace(/[^\w\s.,!?-]/g, '')
        .substring(0, 1000); // Safety limit

      // Simulate TTS processing
      const duration_ms = Math.round(cleanText.length * 30 + Math.random() * 100);

      // Mock audio buffer (would be real audio in production)
      const mockAudio = Buffer.from(`Mock audio for: ${cleanText}`);

      return {
        success: true,
        audio: mockAudio,
        duration_ms,
        method: 'offline',
        format: 'WAV',
        sample_rate: 16000
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Synthesize using fallback engine
   */
  async synthesizeFallback(text, options = {}) {
    try {
      // In production: call Piper CLI or API
      // For now: mock

      const cleanText = text
        .replace(/[^\w\s.,!?-]/g, '')
        .substring(0, 1000);

      const duration_ms = Math.round(cleanText.length * 25 + Math.random() * 100);
      const mockAudio = Buffer.from(`Fallback audio for: ${cleanText}`);

      return {
        success: true,
        audio: mockAudio,
        duration_ms,
        method: 'fallback',
        format: 'WAV',
        sample_rate: 16000
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Prepare response text (neutral, technical tone)
   */
  prepareResponseText(intent, data) {
    const responses = {
      status: () => {
        return `O sistema está ${data.status || 'desconhecido'}. ${data.details || 'Nenhum detalhe disponível.'}`;
      },
      metrics: () => {
        return `Métricas gerais: Total de sugestões, ${data.total || 0}. Taxa de aceitação, ${(data.accept_rate || 0) * 100}%. ${data.details || ''}`;
      },
      explain: () => {
        return `Última decisão: ${data.decision || 'desconhecida'}. Motivo: ${data.reason || 'não disponível'}. ${data.explanation || ''}`;
      },
      history: () => {
        return `Histórico recente: ${data.count || 0} eventos. Últimos: ${data.recent || 'não disponível'}.`;
      },
      decisions: () => {
        return `Decisões registradas: ${data.count || 0}. Status: ${data.status || 'desconhecido'}.`;
      },
      blocked: () => {
        return `Comando bloqueado. ${data.reason || 'Razão não informada.'}`;
      },
      error: () => {
        return `Erro ao processar requisição. Por favor, tente novamente.`;
      }
    };

    const generator = responses[intent] || responses.error;
    return generator();
  }
}

module.exports = VoiceResponder;
