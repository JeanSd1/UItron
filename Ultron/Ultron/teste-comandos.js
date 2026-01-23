#!/usr/bin/env node

/**
 * TESTE RÁPIDO - Simular comandos sem voz
 * 
 * Mostra exatamente o que Ultron vai fazer quando você falar!
 */

const readline = require('readline');
const cmdExecutor = require('./app/voice/command_executor');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

async function testCommand(input) {
  console.log(`\n${colors.cyan}[TESTE]${colors.reset} "${input}"\n`);
  
  const parsed = cmdExecutor.parseCommand(input);
  
  if (!parsed) {
    console.log(`${colors.red}❌ Comando não reconhecido${colors.reset}\n`);
    return;
  }
  
  console.log(`${colors.green}✅ Detectado: ${parsed.action}${colors.reset}`);
  console.log(`   Parâmetros: ${JSON.stringify(parsed.params)}`);
  console.log(`\n   ${colors.yellow}[Simulando execução...]${colors.reset}`);
  
  // Simular execução
  const result = cmdExecutor.executeAction(parsed.action, parsed.params);
  console.log(`\n   ${colors.green}[RESULTADO]${colors.reset}`);
  console.log(`   ${result}\n`);
}

async function main() {
  console.clear();
  console.log(`
${colors.bright}${colors.magenta}╔════════════════════════════════════════════════════╗${colors.reset}
${colors.bright}${colors.magenta}║  ULTRON - TESTE DE COMANDOS AVANÇADOS              ║${colors.reset}
${colors.bright}${colors.magenta}║  (Teste sem usar o microfone)                      ║${colors.reset}
${colors.bright}${colors.magenta}╚════════════════════════════════════════════════════╝${colors.reset}

${colors.cyan}Digite os comandos abaixo para testar:${colors.reset}
(ou ${colors.bright}sair${colors.reset} para voltar para Ultron)\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const prompt = () => {
    rl.question(`${colors.bright}[TESTE]${colors.reset} Digite comando: `, async (input) => {
      if (input.toLowerCase() === 'sair') {
        console.log(`\n${colors.green}✅ Voltando para Ultron...${colors.reset}\n`);
        rl.close();
        return;
      }
      
      if (input.trim()) {
        await testCommand(input);
      }
      
      prompt();
    });
  };

  prompt();
}

main();
