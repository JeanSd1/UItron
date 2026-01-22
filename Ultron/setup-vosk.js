#!/usr/bin/env node

/**
 * VOSK - Voice Recognition (Offline, Portuguese)
 * Funciona 100% sem Windows Speech Recognition
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const VOSK_MODEL_DIR = path.join(__dirname, 'vosk_model');
const MODEL_URL = 'https://alphacephei.com/vosk/models/vosk-model-pt-0.3.zip';
const ZIP_FILE = path.join(__dirname, 'vosk_model.zip');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  🎤 CONFIGURANDO VOSK (VOZ OFFLINE)          ║');
console.log('╚════════════════════════════════════════════════╝\n');

// ===== PASSO 1: Verificar se Vosk está instalado =====
console.log('1️⃣  Verificando Vosk...\n');

try {
    require('vosk');
    console.log('✅ Vosk já instalado\n');
} catch (e) {
    console.log('❌ Vosk não instalado!');
    console.log('\n⏳ Instale com:\n');
    console.log('   npm install vosk\n');
    process.exit(1);
}

// ===== PASSO 2: Verificar modelo português =====
console.log('2️⃣  Verificando modelo de voz português...\n');

if (fs.existsSync(VOSK_MODEL_DIR)) {
    console.log('✅ Modelo já baixado\n');
} else {
    console.log('⏳ Baixando modelo português (100MB)...');
    console.log('   Isto vai levar 2-5 minutos...\n');
    
    try {
        // Download simples via PowerShell (mais rápido)
        const psScript = `
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -Uri "${MODEL_URL}" -OutFile "${ZIP_FILE}" -TimeoutSec 300
`;
        execSync(`powershell -NoProfile -Command "${psScript}"`, {
            stdio: 'inherit',
            timeout: 600000
        });
        
        console.log('\n✅ Download completo');
        console.log('⏳ Descompactando...\n');
        
        // Descompactar
        execSync(`powershell -Command "Expand-Archive -Path '${ZIP_FILE}' -DestinationPath '${__dirname}' -Force"`, {
            stdio: 'pipe'
        });
        
        // Renomear pasta
        const extractedDir = path.join(__dirname, 'vosk-model-pt-0.3');
        if (fs.existsSync(extractedDir)) {
            fs.renameSync(extractedDir, VOSK_MODEL_DIR);
        }
        
        // Limpar ZIP
        fs.unlinkSync(ZIP_FILE);
        
        console.log('✅ Modelo pronto!\n');
        
    } catch (e) {
        console.log('❌ Erro ao baixar modelo');
        console.log('\n🔧 Tente manualmente:');
        console.log('   1. Visite: https://alphacephei.com/vosk/models');
        console.log('   2. Baixe: vosk-model-pt-0.3.zip');
        console.log('   3. Descompacte em:', VOSK_MODEL_DIR);
        process.exit(1);
    }
}

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  ✅ VOSK PRONTO!                              ║');
console.log('╚════════════════════════════════════════════════╝\n');

console.log('🎉 Próximos passos:\n');
console.log('1️⃣  Execute: node ultron-vosk.js');
console.log('2️⃣  Pressione ENTER');
console.log('3️⃣  FALE seu comando');
console.log('4️⃣  Ultron reconhece e executa!\n');

console.log('📝 Exemplo de comandos:');
console.log('   "abra o notepad"');
console.log('   "crie um documento"');
console.log('   "qual é a hora"\n');
