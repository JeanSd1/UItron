#!/usr/bin/env node

/**
 * INSTALAR BUILD TOOLS PARA VOSK
 * Execute como ADMIN!
 */

const { execSync } = require('child_process');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  🔧 INSTALANDO BUILD TOOLS PARA VOSK         ║');
console.log('╚════════════════════════════════════════════════╝\n');

// Verificar ADMIN
try {
    execSync('net session', { stdio: 'pipe' });
} catch (e) {
    console.log('❌ Você PRECISA ser ADMIN!\n');
    console.log('Execute este script como ADMINISTRADOR!\n');
    process.exit(1);
}

console.log('✅ Rodando como ADMIN\n');

console.log('⏳ Instalando windows-build-tools (pode levar 10-15 minutos)...\n');
console.log('Isto vai instalar:');
console.log('  • Python');
console.log('  • Visual C++ Build Tools');
console.log('  • Tudo necessário para compilar módulos C++\n');

try {
    execSync('npm install --global windows-build-tools', {
        stdio: 'inherit',
        timeout: 1800000 // 30 minutos
    });
    
    console.log('\n✅ Build Tools instalados!\n');
    console.log('Agora execute:\n');
    console.log('  npm install vosk --legacy-peer-deps\n');
    console.log('Depois:\n');
    console.log('  node setup-vosk.js\n');
    
} catch (e) {
    console.log('\n❌ Erro ao instalar\n');
    console.log('Tente manualmente:\n');
    console.log('  npm install --global windows-build-tools\n');
    process.exit(1);
}
