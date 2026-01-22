const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "..", "logs", "ultron.log");

function log(level, message, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  };

  fs.appendFileSync(logFile, JSON.stringify(entry) + "\n", { encoding: "utf8" });
}

module.exports = {
  info: (msg, meta) => log("INFO", msg, meta),
  warn: (msg, meta) => log("WARN", msg, meta),
  error: (msg, meta) => log("ERROR", msg, meta)
};
