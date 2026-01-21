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
      'calc': 'calc.exe',
      'ianydesk': 'ianydesk.exe',
      'anydesk': 'anydesk.exe',
      'teamviewer': 'teamviewer.exe',
      'vscode': 'code.exe',
      'visual studio': 'devenv.exe',
      'spotify': 'spotify.exe',
      'discord': 'discord.exe',
      'telegram': 'telegram.exe',
      'edge': 'msedge.exe',
      'safari': 'safari.exe'
    };
    
    const program = programMap[programName.toLowerCase()] || programName + '.exe';
    execSync(`start ${program}`, { stdio: 'pipe' });
    
    return `Abrindo ${programName}...`;
  } catch (error) {
    // Se falhar com .exe, tenta sem
    try {
      execSync(`start ${programName}`, { stdio: 'pipe' });
      return `Abrindo ${programName}...`;
    } catch (error2) {
      return `Erro ao abrir ${programName}. Verifique se está instalado.`;
    }
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
 * Executar comando PowerShell genérico
 */
function executeGenericCommand(input) {
  try {
    const result = execSync(`powershell -NoProfile -Command "${input}"`, {
      encoding: 'utf-8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return result.trim() || 'Comando executado com sucesso.';
  } catch (error) {
    return `Erro: ${error.message}`;
  }
}

/**
 * Criar pasta
 */
function createFolder(folderName) {
  try {
    const folderPath = path.join(process.cwd(), folderName);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      return `Pasta "${folderName}" criada com sucesso.`;
    }
    return `Pasta "${folderName}" já existe.`;
  } catch (error) {
    return `Erro ao criar pasta: ${error.message}`;
  }
}

/**
 * Listar conteúdo de pasta
 */
function listFolderContents(folderPath) {
  try {
    const fullPath = folderPath.startsWith('/') || folderPath.includes(':') 
      ? folderPath 
      : path.join(process.cwd(), folderPath);
    
    if (!fs.existsSync(fullPath)) {
      return `Pasta "${folderPath}" não encontrada.`;
    }
    
    const files = fs.readdirSync(fullPath);
    return `Conteúdo de "${folderPath}": ${files.join(', ')}`;
  } catch (error) {
    return `Erro ao listar pasta: ${error.message}`;
  }
}

/**
 * Abrir arquivo ou pasta no explorer
 */
function openInExplorer(pathStr) {
  try {
    const fullPath = pathStr.startsWith('/') || pathStr.includes(':') 
      ? pathStr 
      : path.join(process.cwd(), pathStr);
    
    execSync(`explorer "${fullPath}"`, { stdio: 'pipe' });
    return `Abrindo ${pathStr} no Explorer...`;
  } catch (error) {
    return `Erro ao abrir no Explorer: ${error.message}`;
  }
}

/**
 * Buscar arquivo
 */
function searchFile(filename) {
  try {
    const cmd = `Get-ChildItem -Path C:\\ -Name "${filename}" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 5`;
    const result = execSync(`powershell -NoProfile -Command "${cmd}"`, {
      encoding: 'utf-8',
      timeout: 15000
    });
    return result.trim() || `Arquivo "${filename}" não encontrado.`;
  } catch (error) {
    return `Erro ao buscar arquivo: ${error.message}`;
  }
}

/**
 * Abrir URL
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
 * Navegar para uma pasta e executar comando
 */
function navigateAndExecute(directory, command) {
  try {
    // Mudar para o diretório
    process.chdir(directory);
    
    // Re-parsear o comando no novo diretório
    const parsed = parseCommand(command);
    
    if (!parsed) {
      return `Não consegui entender o comando: "${command}"`;
    }
    
    // Executar a ação usando executeCommand
    return executeCommand(parsed);
  } catch (error) {
    return `Erro ao navegar para ${directory}: ${error.message}`;
  }
}

/**
 * Processar comando natural e converter para ação
 */
function parseCommand(input) {
  const lowerInput = input.toLowerCase();
  
  // ============================================================
  // PRIORIDADE -1: Ir para área de trabalho e criar documento
  // ============================================================
  // "va na area de trabalho crie um documento com nome oi"
  // "vá para área de trabalho e crie arquivo chamado X"
  
  if ((lowerInput.includes('va') || lowerInput.includes('vá')) && 
      (lowerInput.includes('area de trabalho') || lowerInput.includes('área de trabalho') ||
       lowerInput.includes('desktop'))) {
    
    // Extrair o que vem DEPOIS de "area de trabalho"
    const afterDesktop = input.match(/(?:area de trabalho|área de trabalho|desktop)\s+(.+)/i);
    
    if (afterDesktop) {
      const remainingCommand = afterDesktop[1].trim();
      
      // Se tem "crie" ou "criar" depois, processar recursivamente
      if (remainingCommand.match(/^(crie|criar|novo)/i)) {
        // Navegar para Desktop e executar o restante do comando
        return {
          action: 'navigateAndExecute',
          params: [
            path.join(require('os').homedir(), 'Desktop'),
            remainingCommand
          ]
        };
      }
    }
  }
  
  // ============================================================
  // PRIORIDADE 0: Criar arquivo com nome específico
  // ============================================================
  // "crie um documento com nome oi"
  // "crie arquivo de texto com nome teste"
  // "criar documento chamado X"
  
  if ((lowerInput.includes('crie') || lowerInput.includes('criar') || lowerInput.includes('novo')) &&
      (lowerInput.includes('documento') || lowerInput.includes('arquivo')) &&
      (lowerInput.includes('com nome') || lowerInput.includes('chamado') || lowerInput.includes('nomeado'))) {
    
    // Procura: "com nome X", "chamado X", "nomeado X"
    let nameMatch = input.match(/(?:com nome|chamado|nomeado)\s+([^\s,.!?]+)/i);
    
    if (nameMatch) {
      let filename = nameMatch[1].trim();
      
      // Adiciona extensão .txt se não tiver
      if (!filename.includes('.')) {
        filename += '.txt';
      }
      
      return {
        action: 'createTextFile',
        params: [filename, '']  // Arquivo vazio ou com conteúdo padrão
      };
    }
  }
  
  // ============================================================
  // PRIORIDADE 1: Abrir documento COM TEXTO
  // ============================================================
  // "abra novo documento e escrava X"
  // "crie arquivo e escreve X"  
  // Deve SER CHECADO PRIMEIRO para não conflitar com "abra programa"
  
  if ((lowerInput.includes('documento') || lowerInput.includes('arquivo')) &&
      (lowerInput.includes('escreva') || lowerInput.includes('escreve'))) {
    
    // Procura os padrões: "escreva X", "escrevo X"
    let textMatch = input.match(/escreva\s+(.+)(?:\s|$)/i) || 
                     input.match(/escrevo\s+(.+)(?:\s|$)/i) ||
                     input.match(/escreve\s+(.+)(?:\s|$)/i);
    
    if (textMatch) {
      const text = textMatch[1].trim();
      if (text && text.length > 0) {
        return {
          action: 'openNotepadWithText',
          params: [text]
        };
      }
    }
  }
  
  // ============================================================
  // PRIORIDADE 2: Escrever em arquivo específico
  // ============================================================
  // "escreva X em arquivo Y"
  // "escreva olá mundo em documento"
  
  if ((lowerInput.includes('escreva') || lowerInput.includes('escrever')) && lowerInput.includes('em')) {
    const textMatch = input.match(/escreva?\s+(.+?)\s+em/i) || input.match(/escrever\s+(.+?)\s+em/i);
    const fileMatch = input.match(/em\s+(?:arquivo\s+)?(.+?)(?:\s|$)/i);
    
    if (textMatch && fileMatch) {
      const text = textMatch[1].trim();
      const filename = fileMatch[1].trim() || 'documento.txt';
      
      return {
        action: 'createTextFile',
        params: [filename, text]
      };
    }
  }
  
  // ============================================================
  // PRIORIDADE 3: Abrir programa
  // ============================================================
  // "abra notepad", "abrir calculadora", etc
  // MAS NÃO se estiver combinado com "escreve/escreva"
  
  if ((lowerInput.includes('abra') || lowerInput.includes('abrir')) && 
      !lowerInput.includes('escreva') && !lowerInput.includes('escreve')) {
    let program = null;
    
    // Padrões específicos com prioridade
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
      // Fallback: extrair nome genérico após "abra" ou "abrir"
      // "abra ianydesk" → "ianydesk"
      // "abrir some program" → "some program"
      const programMatch = input.match(/(?:abra|abrir)\s+(.+?)(?:\s+$|$)/i);
      if (programMatch) {
        program = programMatch[1].trim();
        // Se tem múltiplas palavras, usa como nome (ex: "visual studio")
        // Senão pega só primeira (ex: "ianydesk")
        if (!program.includes(' ')) {
          program = program.split(/\s+/)[0];
        }
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
  
  // ============================================================
  // NOVOS COMANDOS GENÉRICOS (ANTES de listar arquivos)
  // ============================================================
  
  // Criar pasta
  // "crie uma pasta chamada X", "criar diretório X"
  if ((lowerInput.includes('crie') || lowerInput.includes('criar')) && 
      (lowerInput.includes('pasta') || lowerInput.includes('diretório') || lowerInput.includes('folder'))) {
    const nameMatch = input.match(/(?:pasta|diretório|folder)\s+(?:chamada|chamado|named)\s+([^\s,.!?]+)/i) ||
                      input.match(/(?:pasta|diretório|folder)\s+([^\s,.!?]+)/i);
    if (nameMatch) {
      return {
        action: 'createFolder',
        params: [nameMatch[1].trim()]
      };
    }
  }
  
  // Listar conteúdo de pasta específica
  // "liste pasta X", "mostra conteúdo de X", "o que tem em X"
  if ((lowerInput.includes('liste') || lowerInput.includes('list') || lowerInput.includes('mostra') || 
       lowerInput.includes('o que tem') || lowerInput.includes('conteúdo')) && 
      (lowerInput.includes('pasta') || lowerInput.includes('em') || lowerInput.includes('de') || lowerInput.includes('diretório'))) {
    const pathMatch = input.match(/(?:em|de|pasta)\s+(.+?)(?:\s+de\s+|,|$)/i) ||
                      input.match(/conteúdo\s+(?:de|em)\s+(.+?)(?:\s|$)/i) ||
                      input.match(/liste\s+(.+?)(?:\s|$)/i);
    if (pathMatch) {
      return {
        action: 'listFolderContents',
        params: [pathMatch[1].trim()]
      };
    }
  }
  
  // Abrir em explorer
  // "abra pasta X", "abre explorer de X", "mostra arquivo em X"
  if ((lowerInput.includes('abra') || lowerInput.includes('abre') || lowerInput.includes('mostra')) &&
      (lowerInput.includes('pasta') || lowerInput.includes('explorer') || lowerInput.includes('arquivo'))) {
    const pathMatch = input.match(/(?:pasta|de|em)\s+(.+?)(?:\s|$)/i) ||
                      input.match(/explorer\s+(.+?)(?:\s|$)/i);
    if (pathMatch) {
      return {
        action: 'openInExplorer',
        params: [pathMatch[1].trim()]
      };
    }
  }
  
  // Buscar arquivo
  // "procure arquivo X", "busca arquivo X", "encontre X"
  if ((lowerInput.includes('procure') || lowerInput.includes('busca') || 
       lowerInput.includes('encontre') || lowerInput.includes('search')) &&
      (lowerInput.includes('arquivo') || lowerInput.includes('file'))) {
    const fileMatch = input.match(/(?:arquivo|file)\s+([^\s,.!?]+)/i) ||
                      input.match(/(?:procure|busca|encontre|search)\s+(.+?)(?:\s|$)/i);
    if (fileMatch) {
      return {
        action: 'searchFile',
        params: [fileMatch[1].trim()]
      };
    }
  }
  
  // Listar arquivos (SEM especificação = pasta atual)
  if ((lowerInput.includes('liste') || lowerInput.includes('listar') || lowerInput.includes('mostrar arquivos')) &&
      !lowerInput.includes('pasta') && !lowerInput.includes('em') && !lowerInput.includes('de')) {
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
    case 'navigateAndExecute':
      return navigateAndExecute(...params);
    case 'createFolder':
      return createFolder(...params);
    case 'listFolderContents':
      return listFolderContents(...params);
    case 'openInExplorer':
      return openInExplorer(...params);
    case 'searchFile':
      return searchFile(...params);
    case 'executeGenericCommand':
      return executeGenericCommand(...params);
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
  navigateAndExecute,
  executePowerShellCommand,
  executeGenericCommand,
  createFolder,
  listFolderContents,
  openInExplorer,
  searchFile
};
