const { exportAsCsv } = require('./tools/export-suggestions');
const fs = require('fs');

const hist = JSON.parse(fs.readFileSync('./data/suggestion_history.json', 'utf8'));
const csv = exportAsCsv(hist.suggestions);

console.log('CSV Output:');
console.log(csv);
console.log('\n\nLine count validation:');
csv.split('\n').forEach((line, i) => {
  const fieldCount = line.match(/(?:[^,"]|"(?:[^"]|"")*")+/g)?.length || 0;
  console.log(`Line ${i}: ${fieldCount} fields`);
});
