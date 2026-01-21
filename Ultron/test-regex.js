const input = 'abra um novo documento de texto e escreva ola mundo';
console.log('Input:', input);

// Teste 1
const pattern1 = /escreve?\s+([^,.!?]+?)(?:[,!?\s]|$)/i;
const match1 = input.match(pattern1);
console.log('Pattern 1 match:', match1 ? match1[1] : 'NO MATCH');

// Teste 2
const pattern2 = /escreve?\s+(.+)$/i;
const match2 = input.match(pattern2);
console.log('Pattern 2 match:', match2 ? match2[1] : 'NO MATCH');

// Teste 3
const pattern3 = /escreva\s+(.+)/i;
const match3 = input.match(pattern3);
console.log('Pattern 3 match:', match3 ? match3[1] : 'NO MATCH');
