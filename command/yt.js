const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");
const { MessageMedia } = require("whatsapp-web.js");

ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = async function ytCommand(client, msg, fakeTyping) {
  try {
    const chat = await msg.getChat();
    const args = msg.body.split(" ");
    const cmd = args[0].toLowerCase();
    const url = args[1];

    if (!url || !ytdl.validateURL(url)) {
      return msg.reply(
        "❌ Kirim link YouTube yang valid!\n\nContoh:\n.ytmp3 https://youtu.be/xxxxxx\n.ytmp4 https://youtu.be/xxxxxx"
      );
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");
    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const fileName = `${title}_${Date.now()}`;
    const outputPath =
      cmd === ".ytmp3"
        ? path.join(tempDir, `${fileName}.mp3`)
        : path.join(tempDir, `${fileName}.mp4`);

    await fakeTyping(chat);

    msg.reply(`⬇️ Sedang mengunduh *${title}*...`);

    if (cmd === ".ytmp3") {
      await new Promise((resolve, reject) => {
        ffmpeg(ytdl(url, { quality: "highestaudio" }))
          .audioBitrate(128)
          .save(outputPath)
          .on("end", resolve)
          .on("error", reject);
      });

      const media = MessageMedia.fromFilePath(outputPath);
      await client.sendMessage(msg.from, media, {
        caption: `🎧 *${title}*\nBerhasil diunduh!`,
      });
    } else if (cmd === ".ytmp4") {
      await new Promise((resolve, reject) => {
        ffmpeg(ytdl(url, { quality: "highestvideo" }))
          .save(outputPath)
          .on("end", resolve)
          .on("error", reject);
      });

      const media = MessageMedia.fromFilePath(outputPath);
      await client.sendMessage(msg.from, media, {
        caption: `🎬 *${title}*\nBerhasil diunduh!`,
      });
    }

    fs.unlinkSync(outputPath);
  } catch (err) {
    console.error("YouTube Download Error:", err);
    msg.reply("❌ Gagal mengunduh video/audio. Coba link lain.");
  }
};
