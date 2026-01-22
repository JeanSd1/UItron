#!/usr/bin/env node

/**
 * DOWNLOAD ROBUSTO DO MODELO VOSK
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const MODEL_DIR = path.join(__dirname, 'vosk_model');
const ZIP_FILE = path.join(__dirname, 'model.zip');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  📥 BAIXANDO MODELO PORTUGUÊS VOSK           ║');
console.log('╚════════════════════════════════════════════════╝\n');

// URLs alternativas
const URLs = [
    'https://alphacephei.com/vosk/models/vosk-model-pt-0.3.zip',
    'https://github.com/alphacep/vosk-models/releases/download/vosk-model-pt-0.3/vosk-model-pt-0.3.zip'
];

let urlIndex = 0;

async function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        console.log(`Baixando de: ${url.split('/')[2]}`);
        console.log('⏳ Aguarde (pode levar minutos)...\n');

        const file = fs.createWriteStream(dest);
        
        const request = https.get(url, (response) => {
            const len = parseInt(response.headers['content-length'], 10);
            let downloaded = 0;

            response.on('data', (chunk) => {
                downloaded += chunk.length;
                const percent = Math.round((downloaded / len) * 100);
                process.stdout.write(`\rProgresso: ${percent}% (${(downloaded / 1024 / 1024).toFixed(1)}MB)`);
            });

            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log('\n\n✅ Download completo\n');
                resolve();
            });
        });

        request.on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });

        file.on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

async function main() {
    try {
        // Tentar cada URL
        for (let i = 0; i < URLs.length; i++) {
            try {
                console.log(`Tentativa ${i + 1}/${URLs.length}\n`);
                await downloadFile(URLs[i], ZIP_FILE);
                break;
            } catch (e) {
                console.log(`❌ Falhou. Tentando próxima URL...\n`);
                if (i === URLs.length - 1) throw e;
            }
        }

        // Extrair
        console.log('📦 Extraindo modelo...\n');
        
        // Se pasta existe, remove
        if (fs.existsSync(MODEL_DIR)) {
            execSync(`rmdir /s /q "${MODEL_DIR}"`, { stdio: 'pipe' });
        }

        // Descompactar com PowerShell
        execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${ZIP_FILE}' -DestinationPath '${__dirname}' -Force"`, {
            stdio: 'pipe',
            timeout: 60000
        });

        // Renomear pasta se necessário
        const extractedDirs = fs.readdirSync(__dirname).filter(f => 
            f.includes('vosk-model') && f !== 'vosk_model'
        );

        if (extractedDirs.length > 0) {
            const extracted = path.join(__dirname, extractedDirs[0]);
            if (fs.existsSync(extracted)) {
                execSync(`move "${extracted}" "${MODEL_DIR}"`, { stdio: 'pipe' });
            }
        }

        // Remover ZIP
        if (fs.existsSync(ZIP_FILE)) {
            fs.unlinkSync(ZIP_FILE);
        }

        console.log('✅ Modelo extraído com sucesso!\n');

        console.log('╔════════════════════════════════════════════════╗');
        console.log('║  ✅ PRONTO PARA FALAR!                        ║');
        console.log('╚════════════════════════════════════════════════╝\n');

        console.log('Execute:\n');
        console.log('  node ultron-vosk.js\n');
        console.log('Pressione ENTER e FALE em português!\n');

    } catch (e) {
        console.log('\n❌ Erro: ' + e.message);
        console.log('\n🔧 DOWNLOAD MANUAL:\n');
        console.log('1. Visite: https://alphacephei.com/vosk/models');
        console.log('2. Baixe: vosk-model-pt-0.3.zip');
        console.log('3. Descompacte em:\n');
        console.log(`   ${MODEL_DIR}\n`);
        console.log('4. Execute: node ultron-vosk.js\n');
        process.exit(1);
    }
}

main();
