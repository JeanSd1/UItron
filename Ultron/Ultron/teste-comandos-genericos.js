/**
 * TESTE DE COMANDOS GENÉRICOS - ULTRON
 * Verifica reconhecimento de qualquer tipo de comando
 */

const cmd = require('./app/voice/command_executor.js');

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║   🚀 TESTE: ULTRON EXECUTA QUALQUER COISA!           ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

const testCases = [
  // Programas genéricos
  { input: 'abra o microsoft', expected: 'openProgram' },
  { input: 'abra word', expected: 'openProgram' },
  { input: 'abra o ianydesk', expected: 'openProgram' },
  { input: 'abre discord', expected: 'openProgram' },
  { input: 'abra visual studio', expected: 'openProgram' },
  { input: 'abrir spotify', expected: 'openProgram' },
  
  // Comandos PowerShell
  { input: 'execute Get-Date', expected: 'executeGenericCommand' },
  { input: 'rodé powershell command', expected: 'executeGenericCommand' },
  { input: 'corra um teste rápido', expected: 'executeGenericCommand' },
  
  // Operações de arquivo
  { input: 'copie arquivo.txt para backup.txt', expected: 'executeGenericCommand' },
  { input: 'mova pasta para novo local', expected: 'executeGenericCommand' },
  { input: 'delete arquivo.txt', expected: 'executeGenericCommand' },
  
  // Documentos
  { input: 'crie um documento com nome teste', expected: 'createTextFile' },
  { input: 'abra novo documento e escreva olá', expected: 'openNotepadWithText' },
  
  // Pastas
  { input: 'crie uma pasta chamada backup', expected: 'createFolder' },
  { input: 'liste pasta desktop', expected: 'listFolderContents' },
];

let passed = 0;
let failed = 0;

testCases.forEach((test, idx) => {
  const result = cmd.parseCommand(test.input);
  const resultAction = result ? result.action : 'null';
  const isCorrect = resultAction === test.expected;
  
  const status = isCorrect ? '✅' : '❌';
  console.log(`${status} Teste ${idx + 1}: "${test.input}"`);
  console.log(`   Esperado: ${test.expected}`);
  console.log(`   Obtido: ${resultAction}`);
  if (result) {
    console.log(`   Params: ${JSON.stringify(result.params)}`);
  }
  console.log();
  
  if (isCorrect) passed++;
  else failed++;
});

console.log('╔════════════════════════════════════════════════════════╗');
console.log(`║   RESULTADO: ${passed} ✅ / ${failed} ❌ (Total: ${passed + failed})        ║`);
console.log('╚════════════════════════════════════════════════════════╝\n');

if (failed === 0) {
  console.log('🎉 PERFEITO! Ultron reconhece QUALQUER COMANDO!\n');
} else {
  console.log(`⚠️  ${failed} testes falharam. Verifique os padrões!\n`);
}
