const axios = require("axios");
const { MessageMedia } = require("whatsapp-web.js");

module.exports = async function ytmp4(client, msg) {
  const parts = msg.body.split(" ");
  if (parts.length < 2) {
    return msg.reply(
      "❌ Kirim link YouTube-nya. Contoh: `.ytmp4 https://www.youtube.com/watch?v=XXXXX`"
    );
  }
  const ytUrl = parts[1];

  await msg.reply("🔄 Mencari link video...");

  try {
    const response = await axios.get(
      "https://yt-downloader1.p.rapidapi.com/video",
      {
        params: { url: ytUrl },
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "yt-downloader1.p.rapidapi.com",
        },
      }
    );

    const data = response.data;
    // Struktur respons tergantung API-nya
    // Misalnya data.result.mp4 atau data.result.link
    const videoUrl = data.result?.mp4 || data.result?.link || data.url;
    if (!videoUrl) {
      return msg.reply("❌ Gagal mendapatkan link video MP4.");
    }

    const mediaResp = await axios.get(videoUrl, {
      responseType: "arraybuffer",
    });
    const base64 = Buffer.from(mediaResp.data, "binary").toString("base64");
    const mime = mediaResp.headers["content-type"] || "video/mp4";
    const media = MessageMedia.fromBase64Mime(mime, base64);

    await client.sendMessage(msg.from, media);
  } catch (err) {
    console.error("Error ytmp4:", err.response?.data || err.message);
    msg.reply("❌ Gagal download video.");
  }
};
