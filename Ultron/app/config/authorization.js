/**
 * Middleware de Autorização Condicional
 * 
 * Determina se uma missão requer autorização humana antes de executar
 */

const requiresAuthorization = (mission) => {
  // Missões que SÓ observam (sem risco)
  const readOnlyMissions = ["check_health"];
  
  // Missões que modificam o sistema (requerem autorização)
  const destructiveMissions = ["cleanup_system"];

  return destructiveMissions.includes(mission);
};

/**
 * Gera prompt de autorização baseado no resultado de diagnóstico
 */
function generateAuthPrompt(mission, diagnostics) {
  const prompts = {
    cleanup_system: () => {
      if (diagnostics.summary.status === "nothing_to_clean") {
        return null; // Não precisa de autorização
      }

      return {
        urgency: "normal",
        title: "⚠️ Limpeza de Sistema",
        message: `
Ultron detectou arquivos temporários que podem ser removidos.

📊 Relatório:
${diagnostics.cleaned.map(c => 
  `  • ${c.location}: ${c.filesRemoved} arquivos (${c.sizeFreed})`
).join('\n')}

Total a liberar: ${diagnostics.summary.message.split(': ')[1]}

Deseja autorizar a limpeza? (sim/não)
        `,
        confirmRequired: true
      };
    }
  };

  return prompts[mission] ? prompts[mission]() : null;
}

module.exports = {
  requiresAuthorization,
  generateAuthPrompt
};
