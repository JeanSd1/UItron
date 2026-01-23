/**
 * PASSO 5.1.1 — Voice Adapter (Central Orchestration)
 * 
 * Coordena toda a pipeline de voz
 * Integra STT → Intent → Ultron → TTS
 * Read-only, determinístico, auditável
 */

const VoiceListener = require('./voice_listener');
const VoiceTranscriber = require('./voice_transcriber');
const IntentRouter = require('./intent_router');
const VoiceResponder = require('./voice_responder');
const { auditLog, getVoiceStats } = require('./voice_logger');

class VoiceAdapter {
  constructor(config = {}) {
    this.config = config;
    this.listener = new VoiceListener(config.listener);
    this.transcriber = new VoiceTranscriber(config.transcriber);
    this.router = new IntentRouter(config.router);
    this.responder = new VoiceResponder(config.responder);
    this.state = 'uninitialized';
  }

  /**
   * Initialize entire voice pipeline
   */
  async initialize() {
    try {
      auditLog({
        event_type: 'voice_adapter_init',
        status: 'starting'
      });

      // Initialize components sequentially
      const listenerResult = await this.listener.initialize();
      const transcriberResult = await this.transcriber.initialize();
      const responderResult = await this.responder.initialize();

      const allOk = listenerResult.success && transcriberResult.success && responderResult.success;

      auditLog({
        event_type: 'voice_adapter_init',
        status: allOk ? 'ready' : 'degraded',
        listener_ok: listenerResult.success,
        transcriber_ok: transcriberResult.success,
        responder_ok: responderResult.success
      });

      this.state = allOk ? 'ready' : 'degraded';

      return {
        success: allOk,
        state: this.state,
        components: {
          listener: listenerResult,
          transcriber: transcriberResult,
          responder: responderResult
        }
      };
    } catch (err) {
      auditLog({
        event_type: 'voice_adapter_init',
        status: 'failed',
        error: err.message
      });

      this.state = 'failed';
      return { success: false, error: err.message };
    }
  }

  /**
   * Complete voice interaction pipeline
   * Called when user presses hotkey and speaks
   */
  async processVoiceInput() {
    const session_id = `session_${Date.now()}`;
    const start_time = Date.now();

    try {
      auditLog({
        event_type: 'voice_session_start',
        session_id
      });

      // Step 1: Record audio (wait for user to speak)
      auditLog({
        event_type: 'voice_session_step',
        session_id,
        step: 'waiting_for_input'
      });

      const audioResult = await this.listener.startRecording();
      if (!audioResult.success) {
        throw new Error('Failed to start recording');
      }

      // In production: wait for hotkey release or timeout
      // For now: immediate stop (testing)
      await new Promise(r => setTimeout(r, 100));

      const recordResult = await this.listener.stopRecording();
      if (!recordResult.success) {
        throw new Error('Failed to stop recording');
      }

      const audioData = recordResult.audio;

      // Step 2: Transcribe audio
      auditLog({
        event_type: 'voice_session_step',
        session_id,
        step: 'transcribing',
        audio_duration_ms: recordResult.duration_ms
      });

      const transcriptionResult = await this.transcriber.transcribe(audioData);
      if (!transcriptionResult.success) {
        throw new Error(`Transcription failed: ${transcriptionResult.error}`);
      }

      const transcribedText = transcriptionResult.text;

      // Step 3: Route intent
      auditLog({
        event_type: 'voice_session_step',
        session_id,
        step: 'routing_intent',
        transcribed_text: transcribedText
      });

      const intentResult = this.router.routeIntent(transcribedText);
      if (!intentResult.allowed) {
        // Blocked or unrecognized
        const responseText = this.responder.prepareResponseText(
          intentResult.intent,
          { reason: intentResult.reason }
        );

        const synthesisResult = await this.responder.synthesize(responseText);

        auditLog({
          event_type: 'voice_session_blocked',
          session_id,
          intent: intentResult.intent,
          reason: intentResult.reason,
          response_generated: synthesisResult.success,
          total_time_ms: Date.now() - start_time
        });

        return {
          success: false,
          blocked: true,
          intent: intentResult.intent,
          reason: intentResult.reason,
          audio: synthesisResult.success ? synthesisResult.audio : null,
          session_id
        };
      }

      const intent = intentResult.intent;

      // Step 4: Fetch response data from Ultron (read-only)
      auditLog({
        event_type: 'voice_session_step',
        session_id,
        step: 'fetching_ultron_data',
        intent
      });

      const query = this.router.intentToQuery(intent);
      const ultronData = await this.queryUltronCore(query);

      // Step 5: Generate response text
      auditLog({
        event_type: 'voice_session_step',
        session_id,
        step: 'generating_response',
        query_type: query.type
      });

      const responseText = this.responder.prepareResponseText(intent, ultronData);

      // Step 6: Synthesize speech
      auditLog({
        event_type: 'voice_session_step',
        session_id,
        step: 'synthesizing_speech',
        response_text_length: responseText.length
      });

      const synthesisResult = await this.responder.synthesize(responseText);
      if (!synthesisResult.success) {
        throw new Error(`Synthesis failed: ${synthesisResult.error}`);
      }

      // Success!
      const totalTime = Date.now() - start_time;

      auditLog({
        event_type: 'voice_session_complete',
        session_id,
        status: 'success',
        input_text: transcribedText,
        intent,
        response_text: responseText,
        response_audio_duration_ms: synthesisResult.duration_ms,
        total_time_ms: totalTime
      });

      return {
        success: true,
        blocked: false,
        intent,
        input_text: transcribedText,
        response_text: responseText,
        audio: synthesisResult.audio,
        audio_duration_ms: synthesisResult.duration_ms,
        total_time_ms: totalTime,
        session_id
      };
    } catch (err) {
      auditLog({
        event_type: 'voice_session_error',
        session_id,
        error: err.message,
        total_time_ms: Date.now() - start_time
      });

      return {
        success: false,
        error: err.message,
        session_id
      };
    }
  }

  /**
   * Query Ultron Core for data (read-only)
   */
  async queryUltronCore(query) {
    try {
      // In production: would call actual Ultron modules
      // observability_metrics.js, decision_explainer.js, etc.

      // For now: mock responses
      const responses = {
        system_status: {
          status: 'saudável',
          details: 'Nenhuma missão em estado crítico detectada.'
        },
        all_missions_metrics: {
          total: 127,
          accept_rate: 0.82,
          details: 'Taxa de aceitação global está normal.'
        },
        decision_explanations: {
          decision: 'permitida',
          reason: 'Taxa de aceitação acima do limiar.',
          explanation: 'Última sugestão foi aceita dentro da política.'
        }
      };

      return responses[query.query] || { status: 'desconhecido' };
    } catch (err) {
      return { error: err.message };
    }
  }

  /**
   * Get voice session statistics
   */
  getStats() {
    return getVoiceStats();
  }

  /**
   * Shutdown voice adapter
   */
  async shutdown() {
    try {
      await this.listener.shutdown();

      auditLog({
        event_type: 'voice_adapter_shutdown',
        status: 'complete'
      });

      this.state = 'shutdown';
      return { success: true };
    } catch (err) {
      auditLog({
        event_type: 'voice_adapter_shutdown',
        status: 'error',
        error: err.message
      });

      return { success: false, error: err.message };
    }
  }
}

module.exports = VoiceAdapter;
