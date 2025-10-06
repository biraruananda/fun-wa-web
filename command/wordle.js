// command/wordle.js
const {
  startSession,
  getSession,
  makeGuess,
  endSession,
} = require("../lib/wordleManager");
const { addXP } = require("../lib/profileManager");

function computeUserIdFromMsg(msg) {
  return msg.from && msg.from.endsWith && msg.from.endsWith("@g.us")
    ? msg.author
    : msg.from;
}

module.exports.start = async (client, msg, fakeTyping) => {
  try {
    const userId = computeUserIdFromMsg(msg);

    // cek apakah sudah ada session untuk user ini
    const existing = getSession(userId);
    if (existing) {
      await msg.reply(
        "⚠️ Kamu sudah memiliki sesi Wordle yang berjalan. Gunakan `.w <kata>` untuk menebak atau tunggu sesi berakhir."
      );
      return;
    }

    const session = startSession(userId);
    await fakeTyping(await msg.getChat());
    await msg.reply(
      "🎯 *Wordle dimulai!* Saya memilih sebuah kata 5-huruf.\n" +
        "Kamu punya *6* tebakan.\n\n" +
        "Balas dengan command: `.w <kata>` (contoh: `.w apple`)\n" +
        "Hanya orang yang memulai sesi ini yang bisa menebak.\n\n" +
        "good luck! 🍀"
    );
  } catch (err) {
    console.error("wordle.start error:", err);
    try {
      await msg.reply("❌ Gagal memulai Wordle.");
    } catch {}
  }
};

module.exports.guess = async (client, msg, fakeTyping) => {
  try {
    // parse guess text after ".w "
    const body = msg.body || "";
    const parts = body.trim().split(/\s+/);
    if (parts.length < 2) {
      await msg.reply("❗ Format: `.w <kata>` (contoh: `.w apple`)");
      return;
    }
    const rawGuess = parts[1].toLowerCase();

    const userId = computeUserIdFromMsg(msg);

    // Only session owner can answer: session is keyed by ownerId equal to user's computed id.
    const session = getSession(userId);
    if (!session) {
      await msg.reply(
        "❌ Tidak ada sesi Wordle untukmu. Mulai dengan `.wordle start`."
      );
      return;
    }

    // validate guess
    if (rawGuess.length !== 5 || !/^[a-z]{5}$/.test(rawGuess)) {
      await msg.reply(
        "❗ Tebakan harus 5 huruf (alphabet a-z). Contoh: `.w apple`"
      );
      return;
    }

    // run guess
    await fakeTyping(await msg.getChat());
    const result = makeGuess(userId, rawGuess);

    if (result.error) {
      if (result.error === "AlreadyGuessed") {
        await msg.reply(
          "⚠️ Kata ini sudah kamu tebak sebelumnya. Coba kata lain."
        );
        return;
      } else if (result.error === "InvalidGuess") {
        await msg.reply("❗ Tebakan tidak valid. Gunakan 5 huruf saja (a-z).");
        return;
      } else {
        await msg.reply("❌ Terjadi kesalahan pada tebakan.");
        return;
      }
    }

    // apply XP rules
    if (result.isCorrect) {
      // reward +100 XP
      addXP(userId, 100);
      await msg.reply(
        `🎉 Benar! Kata yang dicari adalah *${result.guess}*.\n` +
          `${result.feedbackSymbols}\n\n` +
          "Kamu mendapatkan *+50 XP*.\n" +
          `Tebakan yang digunakan: ${session.guesses.length}/${6}`
      );
      // end session
      endSession(userId);
      return;
    } else {
      // wrong guess => -10 XP
      addXP(userId, -15);

      if (result.attemptsLeft > 0) {
        await msg.reply(
          `❌ Salah: ${result.guess}\n${result.feedbackSymbols}\n\n` +
            `Sisa tebakan: ${result.attemptsLeft}\n` +
            `Kamu mendapatkan *-10 XP* untuk tebakan ini.`
        );
        return;
      } else {
        // attemptsLeft === 0 => game over
        const secret = session.word;
        // end session
        endSession(userId);
        await msg.reply(
          `💥 Game over! Kamu kehabisan tebakan.\n` +
            `Kata yang benar: *${secret}*\n\n` +
            `Terakhir: ${result.feedbackSymbols}\n` +
            `Untuk mulai lagi, ketik: .wordle start`
        );
        return;
      }
    }
  } catch (err) {
    console.error("wordle.guess error:", err);
    try {
      await msg.reply("❌ Terjadi kesalahan saat memproses tebakan.");
    } catch {}
  }
};
