// command/uplevel.js
const { uplevel, getUserProfile } = require("../lib/profileManager");

function computeUserIdFromMsg(msg) {
  return msg.from && msg.from.endsWith && msg.from.endsWith("@g.us")
    ? msg.author
    : msg.from;
}

module.exports = async (client, msg, fakeTyping) => {
  try {
    const userId = computeUserIdFromMsg(msg);

    // optional fake typing
    if (typeof fakeTyping === "function") {
      try {
        const chat = await msg.getChat();
        await fakeTyping(chat);
      } catch (e) {}
    }

    const res = uplevel(userId);

    if (res.error === "NotEnoughXP") {
      const need = res.needed;
      await msg.reply(
        `❌ Tidak bisa naik level — XP tidak cukup.\n` +
          `Kamu butuh *${need} XP* lagi untuk melakukan .uplevel (1000 XP per level).`
      );
      return;
    }

    const profile = res.profile || getUserProfile(userId);
    await msg.reply(
      `✅ Sukses naik level!\n` +
        `➤ Level sekarang: *${profile.level}*\n` +
        `➤ Sisa XP: *${profile.xp}*`
    );
  } catch (err) {
    console.error("uplevel command error:", err);
    try {
      await msg.reply("❌ Terjadi kesalahan saat mencoba .uplevel");
    } catch {}
  }
};
