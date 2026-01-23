const os = require("os");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

module.exports = async function cleanupSystem(options = {}) {
  const { dryRun = true } = options;
  
  const report = {
    timestamp: new Date().toISOString(),
    dryRun,
    cleaned: [],
    errors: [],
    summary: {
      totalSize: 0,
      filesRemoved: 0,
      status: "pending_authorization"
    }
  };

  // Áreas seguras para limpeza
  const cleanupPaths = [
    { path: path.join(os.tmpdir()), name: "System Temp" },
    { path: "C:\\Windows\\Temp", name: "Windows Temp" },
    { path: path.join(os.homedir(), "AppData\\Local\\Temp"), name: "User Temp" }
  ];

  try {
    for (const target of cleanupPaths) {
      if (!fs.existsSync(target.path)) continue;

      try {
        const files = fs.readdirSync(target.path);
        let pathSize = 0;
        let pathFilesRemoved = 0;

        for (const file of files) {
          const filePath = path.join(target.path, file);
          
          try {
            const stat = fs.statSync(filePath);
            
            // Segurança: apenas arquivos, não pastas
            if (stat.isFile()) {
              pathSize += stat.size;

              if (!dryRun) {
                fs.unlinkSync(filePath);
              }
              
              pathFilesRemoved++;
            }
          } catch (err) {
            // Silenciosamente pula arquivos que não podem ser acessados
            continue;
          }
        }

        if (pathFilesRemoved > 0) {
          report.cleaned.push({
            location: target.name,
            path: target.path,
            filesRemoved: pathFilesRemoved,
            sizeFreed: formatBytes(pathSize),
            sizeFreedRaw: pathSize
          });

          report.summary.totalSize += pathSize;
          report.summary.filesRemoved += pathFilesRemoved;
        }
      } catch (err) {
        report.errors.push({
          location: target.name,
          error: err.message
        });
      }
    }

    // Decisão automática baseada em resultado
    if (report.summary.filesRemoved > 0) {
      report.summary.status = dryRun ? "ready_for_approval" : "completed";
      report.summary.message = dryRun 
        ? `⚠️ Pronto para limpeza: ${formatBytes(report.summary.totalSize)} liberáveis`
        : `✅ Limpeza concluída: ${formatBytes(report.summary.totalSize)} liberados`;
    } else {
      report.summary.status = "nothing_to_clean";
      report.summary.message = "✅ Sistema já está limpo";
    }

  } catch (err) {
    report.summary.status = "error";
    report.summary.message = `❌ Erro: ${err.message}`;
  }

  return report;
};

/**
 * Formata bytes para formato legível
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
