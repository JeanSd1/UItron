const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');
const voiceLogFile = path.join(logsDir, 'ultron_voice.log');

// Garantir que o diretório existe
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function auditLog(eventData) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event_type: eventData.event_type || 'unknown',
    input_text: eventData.input_text || '',
    intent: eventData.intent || '',
    response_text: eventData.response_text || '',
    processing_time_ms: eventData.processing_time_ms || 0,
    status: eventData.status || 'success',
    session_id: eventData.session_id || generateSessionId()
  };
  
  try {
    fs.appendFileSync(voiceLogFile, JSON.stringify(logEntry) + '\n');
    return { success: true, logged: true };
  } catch (error) {
    console.error('[VoiceLogger] Erro ao escrever log:', error);
    return { success: false, error: error.message };
  }
}

function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function readLogs(limit = 100) {
  try {
    if (!fs.existsSync(voiceLogFile)) {
      return { success: true, logs: [], count: 0 };
    }
    
    const content = fs.readFileSync(voiceLogFile, 'utf-8');
    const logs = content
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line))
      .slice(-limit);
    
    return { success: true, logs, count: logs.length };
  } catch (error) {
    console.error('[VoiceLogger] Erro ao ler logs:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  auditLog,
  readLogs,
  generateSessionId
};
