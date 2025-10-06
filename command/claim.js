// command/claim.js
const { getUserProfile, setUserWaifu } = require("../lib/profileManager");
const waifuManager = require("../lib/waifuManager");

function computeUserIdFromMsg(msg) {
  return msg.from && msg.from.endsWith && msg.from.endsWith("@g.us")
    ? msg.author
    : msg.from;
}

module.exports = async (client, msg, fakeTyping) => {
  try {
    const userId = computeUserIdFromMsg(msg);

    // optional fake typing
    try {
      const chat = await msg.getChat();
      if (fakeTyping) await fakeTyping(chat);
    } catch (e) {}

    const pending = waifuManager.getPendingForUser(userId);
    if (!pending) {
      await msg.reply(
        "❌ Tidak ada waifu yang tersedia untuk diklaim. Jalankan `.myistri` dulu."
      );
      return;
    }

    // write to profile
    const profile = setUserWaifu(userId, {
      name: pending.nameCandidate,
      image: pending.url,
      preview: pending.preview_url,
      tags: pending.tags,
      image_id: pending.image_id,
    });

    // clear pending
    waifuManager.clearPendingForUser(userId);

    await msg.reply(
      `✅ Sukses klaim waifu!\n` +
        `➤ Nama: *${profile.waifu.name}*\n` +
        `➤ Tags: ${
          Array.isArray(profile.waifu.tags)
            ? profile.waifu.tags.join(", ")
            : "-"
        }\n` +
        `➤ Tersimpan di profil kamu.`
    );
  } catch (err) {
    console.error("claim command error:", err);
    try {
      await msg.reply("❌ Terjadi kesalahan saat klaim waifu.");
    } catch {}
  }
};
