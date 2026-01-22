const vosk = require("vosk");

const HOTWORD = "ultron";

function containsHotword(text) {
  if (!text) return false;
  return text.toLowerCase().includes(HOTWORD);
}

function stripHotword(text) {
  return text
    .toLowerCase()
    .replace(HOTWORD, "")
    .trim();
}

module.exports = {
  containsHotword,
  stripHotword,
  HOTWORD
};
};
