const fs = require('fs');
const path = require('path');

async function startListening() {
  const audioBuffer = Buffer.alloc(16000); // simular 1s de áudio
  const timestamp = new Date().toISOString();
  
  return {
    success: true,
    audio: audioBuffer,
    duration_ms: Math.random() * 1000 + 500, // 500-1500ms
    timestamp,
    pushed: true,
    confidence: 0.95
  };
}

function stopListening() {
  return {
    success: true,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  startListening,
  stopListening
};
