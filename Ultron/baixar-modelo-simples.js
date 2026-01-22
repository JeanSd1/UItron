#!/usr/bin/env node

/**
 * BAIXAR MODELO VOSK - MÉTODO ALTERNATIVO
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MODEL_DIR = path.join(__dirname, 'vosk_model');
const ZIP_FILE = path.join(__dirname, 'model.zip');

console.log('\n📥 Baixando modelo (método alternativo)...\n');

// URL direta
const URL = 'https://alphacephei.com/vosk/models/vosk-model-pt-0.3.zip';

function download() {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(ZIP_FILE);
        
        https.get(URL, (response) => {
            console.log('Status:', response.statusCode);
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log('✅ Download completo');
                resolve();
            });
        }).on('error', reject);
    });
}

async function main() {
    try {
        await download();
        
        console.log('\n📦 Extraindo...');
        
        // Extrair
        execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${ZIP_FILE}' -DestinationPath '${__dirname}' -Force"`, {
            stdio: 'inherit'
        });
        
        console.log('\n✅ Extraído!');
        
        // Procurar a pasta
        const files = fs.readdirSync(__dirname);
        const modelFolder = files.find(f => f.includes('vosk-model'));
        
        if (modelFolder) {
            const src = path.join(__dirname, modelFolder);
            console.log(`\nRenomeando: ${modelFolder} → vosk_model`);
            
            if (fs.existsSync(MODEL_DIR)) {
                execSync(`rmdir /s /q "${MODEL_DIR}"`, { stdio: 'pipe' });
            }
            
            execSync(`move "${src}" "${MODEL_DIR}"`, { stdio: 'pipe' });
            console.log('✅ Pronto!');
        }
        
        // Remover ZIP
        fs.unlinkSync(ZIP_FILE);
        
        console.log('\n🎤 Execute: node ultron-vosk.js\n');
        
    } catch (e) {
        console.log('❌ Erro:', e.message);
    }
}

main();
