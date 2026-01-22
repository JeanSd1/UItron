#!/usr/bin/env node

/**
 * ULTRON - Menu de Testes Rápido
 * Facilita o acesso a todos os testes
 */

const readline = require('readline');
const { execSync } = require('child_process');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.clear();
console.log(`
╔════════════════════════════════════════════════════════╗
║          🎤 ULTRON - Menu de Testes                    ║
╚════════════════════════════════════════════════════════╝

Escolha uma opção:

  1. 🎤 Rodar Ultron (Voice + Text)
  2. 🧪 Teste rápido do seu comando
  3. 📋 Demonstração de comandos
  4. ❌ Sair

`);

rl.question('Digite a opção [1-4]: ', (choice) => {
  rl.close();

  try {
    const dir = path.join(__dirname, 'Ultron');
    
    switch (choice.trim()) {
      case '1':
        console.log('\n🎤 Iniciando Ultron...\n');
        execSync('node ultron-voice-full.js', { cwd: dir, stdio: 'inherit' });
        break;
      
      case '2':
        console.log('\n🧪 Teste do seu comando...\n');
        execSync('node teste-seu-comando.js', { cwd: dir, stdio: 'inherit' });
        break;
      
      case '3':
        console.log('\n📋 Demonstração de comandos...\n');
        execSync('node demo-comandos-avancados.js', { cwd: dir, stdio: 'inherit' });
        break;
      
      case '4':
        console.log('\nSaindo...\n');
        process.exit(0);
      
      default:
        console.log('\n❌ Opção inválida!\n');
        process.exit(1);
    }
  } catch (error) {
    // Processo foi fechado normalmente
    process.exit(0);
  }
});
