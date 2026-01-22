const os = require("os");
const { execSync } = require("child_process");
const fs = require("fs");

module.exports = async function checkHealth() {
  const cpus = os.cpus();
  const cpuLoad = os.loadavg()[0];

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMemPercent = Math.round(
    ((totalMem - freeMem) / totalMem) * 100
  );

  let diskUsage = "unknown";

  try {
    const output = execSync(
      'wmic logicaldisk get size,freespace,caption',
      { encoding: "utf-8" }
    );

    diskUsage = output
      .split("\n")
      .filter(line => line.includes(":"))[0]
      ?.trim();
  } catch (err) {
    diskUsage = "erro ao verificar disco";
  }

  const report = {
    timestamp: new Date().toISOString(),
    cpu: {
      cores: cpus.length,
      load_1min: cpuLoad
    },
    memory: {
      used_percent: usedMemPercent
    },
    disk: diskUsage,
    status: [],
    recommendations: []
  };

  // Avaliação
  if (usedMemPercent > 75) {
    report.status.push("⚠️ Uso alto de memória");
    report.recommendations.push("Considerar fechar apps pesados");
  }

  if (cpuLoad > cpus.length * 0.7) {
    report.status.push("⚠️ CPU sobrecarregada");
    report.recommendations.push("Verificar processos ativos");
  }

  if (report.status.length === 0) {
    report.status.push("✅ Sistema saudável");
  }

  return report;
};
