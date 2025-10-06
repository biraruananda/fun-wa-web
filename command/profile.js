// command/profile.js
const { getUserProfile } = require("../lib/profileManager");
const { MessageMedia } = require("whatsapp-web.js");
const fs = require("fs");
const path = require("path");

require("dotenv").config();
// bisa pake OWNER_NUMBER (single) atau OWNER_NUMBERS (comma-separated)
const ownersRaw = process.env.OWNER_NUMBERS || process.env.OWNER_NUMBER || "";
const owners = ownersRaw
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function participantsToArray(chat) {
  const raw = chat?.participants;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  // collection-like (whatsapp-web.js might expose map/collection)
  if (typeof raw.array === "function") return raw.array();
  if (typeof raw.forEach === "function") {
    const arr = [];
    raw.forEach((v) => arr.push(v));
    return arr;
  }
  if (raw._collection) return Object.values(raw._collection);
  return Object.values(raw);
}

function isMemberAdmin(member) {
  if (!member) return false;
  // cek beberapa nama properti yang mungkin ada pada object participant
  const adminKeys = [
    "isAdmin",
    "isSuperAdmin",
    "is_super_admin",
    "admin",
    "is_admin",
    "isOwner",
  ];
  for (const k of adminKeys) {
    if (member[k]) return true;
  }
  // kadang flag tersimpan di nested property
  if (
    member.id &&
    member.id.role &&
    (member.id.role === "admin" || member.id.role === "superadmin")
  )
    return true;
  return false;
}

module.exports = async (client, msg, userIdParam, fakeTyping) => {
  try {
    // userId bisa dikirim dari index.js; kalau nggak ada, fallback pakai logika grup/private
    const isGroup = msg.from && msg.from.endsWith && msg.from.endsWith("@g.us");
    const userId = userIdParam || (isGroup ? msg.author : msg.from);
    if (!userId) {
      return msg.reply("❌ Gagal deteksi userId.");
    }

    const contact = await client.getContactById(userId);
    const mentionId = contact.id.user;

    // ambil chat hanya kalau perlu (cek admin)
    const chat = isGroup ? await msg.getChat() : null;

    // ambil/buat profile
    const profile = getUserProfile(userId);

    // tentukan role: default dari profile atau User
    let role = profile.role || "User";

    // cek owner dari env (override)
    if (owners.includes(userId)) {
      role = "Owner";
    } else if (isGroup && chat) {
      // deteksi admin di grup dengan aman
      const participants = participantsToArray(chat);
      const member = participants.find((p) => {
        // p.id bisa berupa object atau string; normalisasi
        const pid =
          (p &&
            p.id &&
            (p.id._serialized || (p.id.user ? `${p.id.user}@c.us` : null))) ||
          (typeof p === "string" ? p : null);
        return pid === userId;
      });

      if (member && isMemberAdmin(member)) {
        // jangan override owner
        if (role !== "Owner") role = "Admin";
      }
    }

    // ambil foto profil WA; kalau gagal fallback ke assets/default.jpg
    let imagePath = path.join(__dirname, "../assets/default.jpg");
    let tempPath = null;

    try {
      const pfpUrl = await client.getProfilePicUrl(userId);
      if (pfpUrl) {
        const media = await MessageMedia.fromUrl(pfpUrl);
        tempPath = path.join(__dirname, `../data/temp_${Date.now()}.jpg`);
        fs.writeFileSync(tempPath, media.data, "base64");
        imagePath = tempPath;
      }
    } catch (e) {
      // fallback tetap imagePath = assets/default.jpg
    }

    // format caption sesuai permintaan
    const caption = `╭━━━〔 👤 *My Profile* 〕━━━╮
│  Hi @${mentionId}!
│
│   ➤ Username: *${contact.pushname || "No Name"}*
│   ➤ Role: *${role}*
│   ➤ XP: *${profile.xp} / 1000*
│   ➤ Level: *${profile.level}*
│   ➤ Coins: *${profile.coins}*
│   ➤ Registered: *${new Date(profile.registeredAt).toLocaleString()}*
│   ➤ Last Active: *${new Date(profile.lastActive).toLocaleString()}*
│
╰━━━━━━━━━━━━━━━━━━━━╯`;

    // kirim (mention contact biar muncul @)
    await client.sendMessage(msg.from, MessageMedia.fromFilePath(imagePath), {
      caption,
      mentions: [contact],
    });

    // hapus temp file jika dibuat
    if (tempPath && fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (e) {
        console.warn("Gagal hapus temp profile pic:", e.message);
      }
    }
  } catch (err) {
    console.error("Error di profile command:", err);
    try {
      await msg.reply("❌ Gagal ambil profil kamu.");
    } catch {}
  }
};
