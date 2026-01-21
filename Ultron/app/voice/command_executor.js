/**
 * ULTRON - Command Execution System
 * 
 * Executa comandos avançados:
 * - Abrir programas
 * - Criar e escrever em arquivos
 * - Simular cliques e digitação
 * - Automação do Windows
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

/**
 * Abrir notepad com conteúdo
 */
function openNotepadWithText(text) {
  try {
    // Criar arquivo temporário com o texto
    const tempFile = path.join(require('os').tmpdir(), `ultron_${Date.now()}.txt`);
    fs.writeFileSync(tempFile, text, 'utf-8');
    
    // Abrir com notepad
    execSync(`notepad "${tempFile}"`, { stdio: 'pipe' });
    
    return `Abri o Notepad com o texto: "${text}"`;
  } catch (error) {
    return `Erro ao abrir Notepad: ${error.message}`;
  }
}

/**
 * Criar arquivo de texto
 */
function createTextFile(filename, content) {
  try {
    const filePath = path.join(process.cwd(), filename);
    fs.writeFileSync(filePath, content, 'utf-8');
    return `Arquivo "${filename}" criado com sucesso com o conteúdo: "${content}"`;
  } catch (error) {
    return `Erro ao criar arquivo: ${error.message}`;
  }
}

/**
 * Executar comando PowerShell
 */
function executePowerShellCommand(command) {
  try {
    const result = execSync(`powershell -NoProfile -Command "${command}"`, {
      encoding: 'utf-8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return result || 'Comando executado com sucesso.';
  } catch (error) {
    return `Erro ao executar comando: ${error.message}`;
  }
}

/**
 * Abrir programa específico
 */
function openProgram(programName) {
  try {
    const programMap = {
      'notepad': 'notepad.exe',
      'word': 'winword.exe',
      'excel': 'excel.exe',
      'chrome': 'chrome.exe',
      'firefox': 'firefox.exe',
      'explorer': 'explorer.exe',
      'calculadora': 'calc.exe',
      'calc': 'calc.exe'
    };
    
    const program = programMap[programName.toLowerCase()] || programName;
    execSync(`start ${program}`, { stdio: 'pipe' });
    
    return `Abrindo ${programName}...`;
  } catch (error) {
    return `Erro ao abrir ${programName}: ${error.message}`;
  }
}

/**
 * Deletar arquivo
 */
function deleteFile(filename) {
  try {
    const filePath = path.join(process.cwd(), filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return `Arquivo "${filename}" deletado com sucesso.`;
    } else {
      return `Arquivo "${filename}" não encontrado.`;
    }
  } catch (error) {
    return `Erro ao deletar arquivo: ${error.message}`;
  }
}

/**
 * Renomear arquivo
 */
function renameFile(oldName, newName) {
  try {
    const oldPath = path.join(process.cwd(), oldName);
    const newPath = path.join(process.cwd(), newName);
    
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      return `Arquivo renomeado de "${oldName}" para "${newName}".`;
    } else {
      return `Arquivo "${oldName}" não encontrado.`;
    }
  } catch (error) {
    return `Erro ao renomear arquivo: ${error.message}`;
  }
}

/**
 * Copiar arquivo
 */
function copyFile(source, destination) {
  try {
    const sourcePath = path.join(process.cwd(), source);
    const destPath = path.join(process.cwd(), destination);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      return `Arquivo copiado de "${source}" para "${destination}".`;
    } else {
      return `Arquivo "${source}" não encontrado.`;
    }
  } catch (error) {
    return `Erro ao copiar arquivo: ${error.message}`;
  }
}

/**
 * Listar arquivos do diretório
 */
function listFiles() {
  try {
    const files = fs.readdirSync(process.cwd());
    return `Arquivos encontrados: ${files.join(', ')}`;
  } catch (error) {
    return `Erro ao listar arquivos: ${error.message}`;
  }
}

/**
 * Abrir URL no navegador
 */
function openURL(url) {
  try {
    const cmd = process.platform === 'win32' ? 'start' : 'open';
    execSync(`${cmd} "${url}"`, { stdio: 'pipe' });
    return `Abrindo ${url} no navegador...`;
  } catch (error) {
    return `Erro ao abrir URL: ${error.message}`;
  }
}

/**
 * Processar comando natural e converter para ação
 */
function parseCommand(input) {
  const lowerInput = input.toLowerCase();
  
  // **NOVO: Abrir notepad com texto inline**
  // "abra novo documento de texto e escreve olá mundo"
  if ((lowerInput.includes('abra') || lowerInput.includes('abrir')) && 
      lowerInput.includes('documento') && 
      lowerInput.includes('escreve')) {
    
    const textMatch = input.match(/escreve\s+(.+)$/i);
    if (textMatch) {
      const text = textMatch[1].trim();
      return {
        action: 'openNotepadWithText',
        params: [text]
      };
    }
  }
  
  // Abrir notepad com texto
  if (lowerInput.includes('abra') && lowerInput.includes('documento') && lowerInput.includes('texto')) {
    // Extrair texto se houver
    const match = input.match(/escreve?\s+(.+)/i) || input.match(/com\s+(.+)/i);
    const text = match ? match[1].trim() : '';
    
    if (text && text !== 'olá mundo') {
      return {
        action: 'openNotepadWithText',
        params: [text]
      };
    }
  }
  
  // "escreva olá mundo em arquivo"
  if (lowerInput.includes('escreva') || lowerInput.includes('escrever')) {
    const textMatch = input.match(/escreva\s+(.+?)\s+em/i) || input.match(/escrever\s+(.+?)\s+em/i);
    const fileMatch = input.match(/em\s+(?:arquivo\s+)?(.+?)(?:\s|$)/i);
    
    if (textMatch && fileMatch) {
      const text = textMatch[1].trim();
      const filename = fileMatch[1].trim() || 'documento.txt';
      
      return {
        action: 'createTextFile',
        params: [filename, text]
      };
    }
    
    // Apenas "escreva X" = criar documento
    if (textMatch) {
      return {
        action: 'openNotepadWithText',
        params: [textMatch[1].trim()]
      };
    }
  }
  
  // Abrir programa
  if (lowerInput.includes('abra') || lowerInput.includes('abrir')) {
    // Tenta extrair nome do programa
    let program = null;
    
    // Padrões específicos
    if (lowerInput.includes('notepad') || lowerInput.includes('documento de texto')) {
      program = 'notepad';
    } else if (lowerInput.includes('word')) {
      program = 'word';
    } else if (lowerInput.includes('excel')) {
      program = 'excel';
    } else if (lowerInput.includes('chrome')) {
      program = 'chrome';
    } else if (lowerInput.includes('firefox')) {
      program = 'firefox';
    } else if (lowerInput.includes('calculadora') || lowerInput.includes('calc')) {
      program = 'calculadora';
    } else {
      // Genérico: pega tudo após "abra" ou "abrir"
      const programMatch = input.match(/abra?\s+(?:novo\s+)?(?:documento de texto|[\w\s]+?)(?:\s+|$)/i);
      if (programMatch) {
        program = programMatch[1].trim();
      }
    }
    
    if (program) {
      return {
        action: 'openProgram',
        params: [program]
      };
    }
  }
  
  // Deletar arquivo
  if (lowerInput.includes('delete') || lowerInput.includes('deletar')) {
    const fileMatch = input.match(/deletar?\s+(?:arquivo\s+)?(.+?)(?:\s+|$)/i);
    if (fileMatch) {
      return {
        action: 'deleteFile',
        params: [fileMatch[1].trim()]
      };
    }
  }
  
  // Renomear arquivo
  if (lowerInput.includes('renomeie') || lowerInput.includes('renomear')) {
    const match = input.match(/renomear?\s+(.+?)\s+para\s+(.+?)(?:\s+|$)/i);
    if (match) {
      return {
        action: 'renameFile',
        params: [match[1].trim(), match[2].trim()]
      };
    }
  }
  
  // Copiar arquivo
  if (lowerInput.includes('copie') || lowerInput.includes('copiar')) {
    const match = input.match(/copiar?\s+(.+?)\s+para\s+(.+?)(?:\s+|$)/i);
    if (match) {
      return {
        action: 'copyFile',
        params: [match[1].trim(), match[2].trim()]
      };
    }
  }
  
  // Listar arquivos
  if (lowerInput.includes('liste') || lowerInput.includes('listar') || lowerInput.includes('mostrar arquivos')) {
    return {
      action: 'listFiles',
      params: []
    };
  }
  
  // Abrir URL
  if (lowerInput.includes('abra') && (lowerInput.includes('http') || lowerInput.includes('www') || lowerInput.includes('google'))) {
    const urlMatch = input.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/i);
    if (urlMatch) {
      return {
        action: 'openURL',
        params: [urlMatch[1]]
      };
    }
  }
  
  return null;
}

/**
 * Executar ação parseada
 */
function executeAction(action, params) {
  switch (action) {
    case 'openNotepadWithText':
      return openNotepadWithText(...params);
    case 'createTextFile':
      return createTextFile(...params);
    case 'openProgram':
      return openProgram(...params);
    case 'deleteFile':
      return deleteFile(...params);
    case 'renameFile':
      return renameFile(...params);
    case 'copyFile':
      return copyFile(...params);
    case 'listFiles':
      return listFiles(...params);
    case 'openURL':
      return openURL(...params);
    default:
      return 'Ação não reconhecida.';
  }
}

module.exports = {
  parseCommand,
  executeAction,
  openNotepadWithText,
  createTextFile,
  openProgram,
  deleteFile,
  renameFile,
  copyFile,
  listFiles,
  openURL,
  executePowerShellCommand
};
