#!/usr/bin/env node

const cmd = require('./app/voice/command_executor.js');

console.log(`
════════════════════════════════════════════════════════
🎯 TESTE: SEU COMANDO EXATO
════════════════════════════════════════════════════════

📢 Você fala: "abra novo documento de texto e escreve olá mundo"

`);

const input = 'abra novo documento de texto e escreve olá mundo';
const parsed = cmd.parseCommand(input);

if (parsed) {
  console.log(`✅ DETECTADO: ${parsed.action}
   Parâmetros: ${JSON.stringify(parsed.params)}

📋 O que vai acontecer:
   1. Cria arquivo TEMP com: "${parsed.params.join(', ')}"
   2. Abre no Notepad
   3. Ultron fala: "Abri o Notepad com o texto: olá mundo"
   4. Você pode editar, copiar, salvar, etc.

✨ Status: PRONTO PARA USAR!`);
} else {
  console.log(`❌ ERRO: Comando não reconhecido!`);
}

console.log(`
════════════════════════════════════════════════════════
`);
