// lib/profileManager.js
const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../data/profiles.json");

// pastikan file data ada
const DATA_DIR = path.dirname(DATA_PATH);
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, "{}", "utf8");

function loadProfiles() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (err) {
    console.error("❌ Gagal load profiles:", err);
    return {};
  }
}

function saveProfiles(data) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Gagal simpan profiles:", err);
  }
}

/**
 * Ambil atau buat profil user
 */
function getUserProfile(userId, username = "Unknown") {
  const profiles = loadProfiles();

  if (!profiles[userId]) {
    profiles[userId] = {
      username,
      xp: 0,
      level: 1,
      coins: 0,
      role: "User",
      waifu: null, // <-- field baru, null bila belum claim
      registeredAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    saveProfiles(profiles);
  } else {
    if (username && profiles[userId].username !== username) {
      profiles[userId].username = username;
      saveProfiles(profiles);
    }
  }

  return profiles[userId];
}

/**
 * Update waktu aktif terakhir user
 */
function updateLastActive(userId) {
  const profiles = loadProfiles();

  if (!profiles[userId]) {
    getUserProfile(userId);
  }

  profiles[userId].lastActive = new Date().toISOString();
  saveProfiles(profiles);
}

/**
 * Tambah / kurangi XP user
 * - XP boleh negatif
 * - Level **tidak** otomatis naik saat xp mencapai 1000; user harus pakai .uplevel
 * - Jika xp < 0 maka level akan dipaksa jadi 0
 */
function addXP(userId, amount = 15) {
  const profiles = loadProfiles();

  if (!profiles[userId]) getUserProfile(userId);

  // pastikan number integer
  const amt = Math.floor(Number(amount) || 0);
  profiles[userId].xp = (profiles[userId].xp || 0) + amt;

  // jika XP jadi negatif, set level jadi 0
  if (profiles[userId].xp < 0) {
    profiles[userId].level = 0;
  }

  saveProfiles(profiles);
  return profiles[userId];
}

/**
 * Uplevel: tukar 1000 XP -> +1 level (manual)
 */
function uplevel(userId) {
  const profiles = loadProfiles();
  if (!profiles[userId]) getUserProfile(userId);

  const profile = profiles[userId];

  if ((profile.xp || 0) < 1000) {
    return {
      error: "NotEnoughXP",
      needed: 1000 - (profile.xp || 0),
      profile,
    };
  }

  profile.xp = profile.xp - 1000;
  profile.level = (profile.level || 0) + 1;

  if (profile.xp < 0) profile.level = 0;

  saveProfiles(profiles);
  return { profile };
}

/**
 * Set waifu info ke profil user
 * waifuObj: { name: string, imageUrl?: string, anime?: string, sourceId?: string }
 */
function setWaifu(userId, waifuObj) {
  const profiles = loadProfiles();
  if (!profiles[userId]) getUserProfile(userId);

  profiles[userId].waifu = waifuObj || null;
  saveProfiles(profiles);
  return profiles[userId];
}

module.exports = {
  getUserProfile,
  updateLastActive,
  addXP,
  uplevel,
  setWaifu,
};
