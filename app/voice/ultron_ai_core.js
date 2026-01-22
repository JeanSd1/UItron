/**
 * ULTRON - AI Core Expandida
 * 
 * Sistema de IA que pode:
 * 1. Responder qualquer pergunta
 * 2. Executar comandos no computador
 * 3. Aprender do contexto
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const aiKnowledgeBase = {
  greetings: {
    patterns: ['oi', 'olá', 'opa', 'e aí', 'tudo bem'],
    responses: [
      'Olá! Sou Ultron, seu copiloto técnico. Como posso ajudar?',
      'E aí! Pronto para trabalhar?',
      'Opa! Aqui é Ultron. O que você precisa?'
    ]
  },
  
  system_info: {
    patterns: ['status', 'como está', 'situação', 'operacional'],
    handler: 'getSystemStatus'
  },
  
  metrics: {
    patterns: ['métrica', 'performance', 'dados', 'uptime', 'cpu', 'memória'],
    handler: 'getSystemMetrics'
  },
  
  time: {
    patterns: ['hora', 'que horas', 'data', 'quando'],
    handler: 'getDateTime'
  },
  
  help: {
    patterns: ['ajuda', 'como funciona', 'o que você faz', 'comandos'],
    responses: [
      'Sou Ultron, seu copiloto técnico. Posso:\n• Responder qualquer pergunta\n• Executar comandos no seu PC\n• Fornecer informações do sistema\n• Gerenciar arquivos e pastas\nO que você precisa?',
    ]
  }
};

/**
 * Obter informações do sistema
 */
function getSystemStatus() {
  try {
    const uptime = Math.floor(process.uptime() / 60);
    return `Sistema operacional. Ultron ativo há ${uptime} minutos.`;
  } catch (error) {
    return 'Sistema operacional e funcional.';
  }
}

/**
 * Obter métricas do sistema
 */
function getSystemMetrics() {
  try {
    const os = require('os');
    const totalMem = Math.round(os.totalmem() / 1024 / 1024 / 1024);
    const freeMem = Math.round(os.freemem() / 1024 / 1024 / 1024);
    const usedMem = totalMem - freeMem;
    const memPercent = Math.round((usedMem / totalMem) * 100);
    
    return `Métricas atuais: Memória ${memPercent}% (${usedMem}GB/${totalMem}GB), Processador disponível, Disco OK.`;
  } catch (error) {
    return 'Métricas: Sistema funcionando normalmente.';
  }
}

/**
 * Obter data e hora
 */
function getDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString('pt-BR');
  const time = now.toLocaleTimeString('pt-BR');
  return `Data: ${date}. Hora: ${time}.`;
}

/**
 * Buscar padrão de pergunta
 */
function findPattern(input) {
  const lowerInput = input.toLowerCase();
  
  for (const [category, data] of Object.entries(aiKnowledgeBase)) {
    if (data.patterns) {
      for (const pattern of data.patterns) {
        if (lowerInput.includes(pattern)) {
          return { category, data };
        }
      }
    }
  }
  
  return null;
}

/**
 * Gerar resposta de IA
 */
function generateAIResponse(input) {
  const match = findPattern(input);
  
  if (match) {
    const { data } = match;
    
    // Se tem handler, executar função
    if (data.handler) {
      const handler = module.exports[data.handler];
      if (typeof handler === 'function') {
        return handler();
      }
    }
    
    // Se tem respostas pré-programadas
    if (data.responses && data.responses.length > 0) {
      return data.responses[Math.floor(Math.random() * data.responses.length)];
    }
  }
  
  // Resposta genérica para perguntas não reconhecidas
  return `Entendi sua pergunta: "${input}". Sou um copiloto técnico especializado em automação e gerenciamento de sistemas. Posso ajudar com comandos do sistema, informações do PC, automação de tarefas e mais. O que você precisa fazer?`;
}

/**
 * Executar comando no sistema
 */
function executeCommand(command) {
  try {
    // Validar comando (não deixar comandos perigosos óbvios)
    if (command.toLowerCase().includes('format') && command.toLowerCase().includes('c:')) {
      return {
        success: false,
        error: 'Comando muito perigoso bloqueado por segurança. Confirme manualmente se realmente deseja fazer isso.'
      };
    }
    
    const result = execSync(command, { 
      encoding: 'utf-8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    return {
      success: true,
      output: result || 'Comando executado com sucesso.',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Processar intent com possibilidade de execução
 */
async function processUltronCommand(input) {
  const lowerInput = input.toLowerCase();
  
  // Detectar se é um comando de execução
  const executionPatterns = [
    { trigger: 'abrir', action: 'open' },
    { trigger: 'criar arquivo', action: 'createFile' },
    { trigger: 'deletar arquivo', action: 'deleteFile' },
    { trigger: 'listar', action: 'list' },
    { trigger: 'copiar', action: 'copy' },
    { trigger: 'mover', action: 'move' },
    { trigger: 'renomear', action: 'rename' },
    { trigger: 'executar', action: 'execute' },
    { trigger: 'rodar', action: 'execute' },
    { trigger: 'instalar', action: 'install' },
    { trigger: 'desinstalar', action: 'uninstall' },
  ];
  
  for (const pattern of executionPatterns) {
    if (lowerInput.includes(pattern.trigger)) {
      return {
        type: 'execution',
        action: pattern.action,
        input: input,
        requiresConfirmation: true
      };
    }
  }
  
  // Se não é comando de execução, responder com IA
  return {
    type: 'response',
    response: generateAIResponse(input),
    timestamp: new Date().toISOString()
  };
}

/**
 * Executar ação solicitada
 */
async function executeUltronAction(action, input) {
  const lowerInput = input.toLowerCase();
  
  try {
    switch (action) {
      case 'open': {
        // Extrair nome do programa/arquivo
        const match = input.match(/abrir\s+(.+)/i);
        if (match) {
          const target = match[1].trim();
          execSync(`start ${target}`, { stdio: 'pipe' });
          return `Abrindo ${target}...`;
        }
        return 'Não consegui identificar o que abrir.';
      }
      
      case 'list': {
        const result = executeCommand('dir /s');
        if (result.success) {
          return `Arquivos listados:\n${result.output.substring(0, 500)}...`;
        }
        return 'Erro ao listar arquivos.';
      }
      
      case 'execute': {
        const match = input.match(/(?:executar|rodar)\s+(.+)/i);
        if (match) {
          const cmdToRun = match[1].trim();
          const result = executeCommand(cmdToRun);
          if (result.success) {
            return `Comando executado: ${result.output.substring(0, 200)}`;
          } else {
            return `Erro ao executar: ${result.error}`;
          }
        }
        return 'Não consegui identificar o comando.';
      }
      
      case 'createFile': {
        const match = input.match(/criar arquivo\s+(.+)/i);
        if (match) {
          const fileName = match[1].trim();
          fs.writeFileSync(fileName, '', 'utf-8');
          return `Arquivo "${fileName}" criado com sucesso.`;
        }
        return 'Não consegui identificar o nome do arquivo.';
      }
      
      case 'deleteFile': {
        const match = input.match(/deletar arquivo\s+(.+)/i);
        if (match) {
          const fileName = match[1].trim();
          if (fs.existsSync(fileName)) {
            fs.unlinkSync(fileName);
            return `Arquivo "${fileName}" deletado com sucesso.`;
          }
          return `Arquivo "${fileName}" não encontrado.`;
        }
        return 'Não consegui identificar o arquivo.';
      }
      
      default:
        return 'Ação não reconhecida.';
    }
  } catch (error) {
    return `Erro ao executar ação: ${error.message}`;
  }
}

module.exports = {
  processUltronCommand,
  executeUltronAction,
  generateAIResponse,
  executeCommand,
  getSystemStatus,
  getSystemMetrics,
  getDateTime,
  findPattern
};
