#!/usr/bin/env node

/**
 * ULTRON - DEMONSTRAÇÃO DE COMANDOS AVANÇADOS
 * 
 * Teste os novos comandos que Ultron pode executar
 */

const cmdExecutor = require('./app/voice/command_executor');

const examples = [
  {
    command: "abra novo documento de texto",
    expected: "Abre Notepad vazio",
    action: "openProgram",
    params: ["notepad"]
  },
  {
    command: "escreva olá mundo em arquivo",
    expected: "Cria arquivo com 'olá mundo'",
    action: "createTextFile",
    params: ["documento.txt", "olá mundo"]
  },
  {
    command: "abrir notepad",
    expected: "Abre Notepad",
    action: "openProgram",
    params: ["notepad"]
  },
  {
    command: "listar arquivos",
    expected: "Lista arquivos do diretório",
    action: "listFiles",
    params: []
  },
  {
    command: "abrir calculadora",
    expected: "Abre Calculadora do Windows",
    action: "openProgram",
    params: ["calculadora"]
  },
  {
    command: "deletar documento.txt",
    expected: "Deleta o arquivo",
    action: "deleteFile",
    params: ["documento.txt"]
  }
];

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  ULTRON - EXEMPLOS DE COMANDOS AVANÇADOS QUE VOCÊ PODE FALAR  ║
╚════════════════════════════════════════════════════════════════╝

Teste estes comandos falando para o Ultron:

`);

examples.forEach((example, i) => {
  console.log(`${i + 1}. "${example.command}"`);
  console.log(`   ├─ Resultado: ${example.expected}`);
  console.log(`   ├─ Ação: ${example.action}`);
  console.log(`   └─ Parâmetros: ${JSON.stringify(example.params)}\n`);
});

console.log(`
═══════════════════════════════════════════════════════════════════

TESTANDO PARSER DE COMANDOS:

`);

const testInputs = [
  "abra novo documento de texto",
  "escreva olá mundo em arquivo",
  "listar arquivos",
  "abrir calculadora",
  "deletar documento.txt"
];

testInputs.forEach((input) => {
  const parsed = cmdExecutor.parseCommand(input);
  console.log(`📢 Entrada: "${input}"`);
  if (parsed) {
    console.log(`   ✅ Detectado: ${parsed.action}`);
    console.log(`   📋 Parâmetros: ${JSON.stringify(parsed.params)}\n`);
  } else {
    console.log(`   ❌ Não reconhecido\n`);
  }
});

console.log(`
═══════════════════════════════════════════════════════════════════

AGORA EXECUTE:  node ultron-voice-full.js

E TESTE FALANDO ESTES COMANDOS!

═══════════════════════════════════════════════════════════════════
`);
