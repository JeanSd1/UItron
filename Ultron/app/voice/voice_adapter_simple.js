const voiceListener = require('./voice_listener_simple');
const voiceTranscriber = require('./voice_transcriber_simple');
const intentRouter = require('./intent_router_simple');
const voiceResponder = require('./voice_responder_simple');
const voiceLogger = require('./voice_logger_simple');

async function processVoiceInput() {
  const sessionId = voiceLogger.generateSessionId();
  const startTime = Date.now();
  
  try {
    // 1. Capturar áudio
    const audio = await voiceListener.startListening();
    if (!audio.success) throw new Error('Falha ao capturar áudio');
    
    // 2. Transcrever
    const transcript = await voiceTranscriber.transcribe(audio.audio);
    if (!transcript.success) throw new Error('Falha ao transcrever');
    
    // 3. Rotear intenção
    const route = intentRouter.routeIntent(transcript.normalized);
    if (!route.success || !route.allowed) {
      voiceLogger.auditLog({
        event_type: 'blocked',
        input_text: transcript.text,
        reason: route.reason || 'Intent não permitida',
        status: 'blocked',
        session_id: sessionId,
        processing_time_ms: Date.now() - startTime
      });
      return { success: false, reason: 'Comando bloqueado' };
    }
    
    // 4. Gerar resposta
    const response = voiceResponder.generateResponse(route.intent);
    if (!response.success) throw new Error('Falha ao gerar resposta');
    
    // 5. Registrar no auditoria
    voiceLogger.auditLog({
      event_type: 'voice_input_processed',
      input_text: transcript.text,
      intent: route.intent,
      response_text: response.response_text,
      status: 'success',
      session_id: sessionId,
      processing_time_ms: Date.now() - startTime
    });
    
    return {
      success: true,
      intent: route.intent,
      response: response.response_text,
      session_id: sessionId,
      processing_time_ms: Date.now() - startTime
    };
  } catch (error) {
    voiceLogger.auditLog({
      event_type: 'error',
      error: error.message,
      status: 'error',
      session_id: sessionId,
      processing_time_ms: Date.now() - startTime
    });
    return { success: false, error: error.message };
  }
}

function getStats() {
  const { logs } = voiceLogger.readLogs();
  const successCount = logs.filter(l => l.status === 'success').length;
  const blockedCount = logs.filter(l => l.status === 'blocked').length;
  const errorCount = logs.filter(l => l.status === 'error').length;
  
  return {
    total_events: logs.length,
    success: successCount,
    blocked: blockedCount,
    errors: errorCount,
    last_event: logs.length > 0 ? logs[logs.length - 1].timestamp : null
  };
}

module.exports = {
  processVoiceInput,
  getStats
};
