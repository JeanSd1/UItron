const fs = require("fs");
const path = require("path");

const historyFile = path.join(__dirname, "..", "missions", "history.json");

function saveMission(entry) {
  const history = JSON.parse(fs.readFileSync(historyFile, "utf-8"));
  history.push(entry);
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
}

module.exports = { saveMission };
