// lib/waifuManager.js
const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../data/waifu_sessions.json");
const DATA_DIR = path.dirname(DATA_PATH);
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, "{}", "utf8");

function loadSessions() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (e) {
    console.error("Failed load waifu sessions:", e);
    return {};
  }
}
function saveSessions(s) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(s, null, 2), "utf8");
  } catch (e) {
    console.error("Failed save waifu sessions:", e);
  }
}

function setLastShown(userId, waifuObj) {
  const s = loadSessions();
  s[userId] = Object.assign({ shownAt: new Date().toISOString() }, waifuObj);
  saveSessions(s);
}
function getLastShown(userId) {
  const s = loadSessions();
  return s[userId] || null;
}
function clearLastShown(userId) {
  const s = loadSessions();
  if (s[userId]) {
    delete s[userId];
    saveSessions(s);
  }
}

module.exports = {
  setLastShown,
  getLastShown,
  clearLastShown,
};
