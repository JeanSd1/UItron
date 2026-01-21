/**
 * Middleware de Autorização Condicional
 * 
 * Determina se uma missão requer autorização humana antes de executar
 */

const { getMissionConfidence } = require("../intelligence/user_profile");

const requiresAuthorization = (mission) => {
  // Missões que SÓ observam (sem risco)
  const readOnlyMissions = ["check_health"];
  
  // Missões que modificam o sistema (requerem autorização)
  const destructiveMissions = ["cleanup_system"];

  return destructiveMissions.includes(mission);
};

/**
 * Gera prompt de autorização baseado no resultado de diagnóstico
 * com contexto aprendido do histórico
 */
function generateAuthPrompt(mission, diagnostics) {
  const prompts = {
    cleanup_system: () => {
      if (diagnostics.summary.status === "nothing_to_clean") {
        return null; // Não precisa de autorização
      }

      // Obter confiança do histórico
      const confidence = getMissionConfidence(mission);
      let confidenceHint = "";

      if (confidence !== null) {
        const confidencePercent = Math.round(confidence * 100);
        confidenceHint =
          confidence >= 0.7
            ? `\n📊 Você costuma autorizar esta ação (${confidencePercent}% das vezes).`
            : `\n📊 Você normalmente prefere não autorizar esta ação.`;
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

Total a liberar: ${diagnostics.summary.message.split(': ')[1]}${confidenceHint}

Deseja autorizar a limpeza? (sim/não)
        `,
        confirmRequired: true,
        confidence: confidence
      };
    }
  };

  return prompts[mission] ? prompts[mission]() : null;
}

module.exports = {
  requiresAuthorization,
  generateAuthPrompt
};
