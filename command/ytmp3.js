const axios = require("axios");
const { MessageMedia } = require("whatsapp-web.js");

module.exports = async function ytmp3(client, msg) {
  const parts = msg.body.split(" ");
  if (parts.length < 2) {
    return msg.reply(
      "❌ Kirim link YouTube-nya. Contoh: `.ytmp3 https://www.youtube.com/watch?v=XXXXX`"
    );
  }
  const ytUrl = parts[1];

  await msg.reply("🔄 Mendapatkan link MP3...");

  try {
    const response = await axios.get(
      "https://yt-downloader1.p.rapidapi.com/audio",
      {
        params: { url: ytUrl },
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "yt-downloader1.p.rapidapi.com",
        },
      }
    );

    const data = response.data;
    const audioUrl = data.result?.mp3 || data.result?.link || data.url;
    if (!audioUrl) {
      return msg.reply("❌ Gagal mendapatkan link MP3.");
    }

    const mediaResp = await axios.get(audioUrl, {
      responseType: "arraybuffer",
    });
    const base64 = Buffer.from(mediaResp.data, "binary").toString("base64");
    const mime = mediaResp.headers["content-type"] || "audio/mpeg";
    const media = MessageMedia.fromBase64Mime(mime, base64);

    await client.sendMessage(msg.from, media);
  } catch (err) {
    console.error("Error ytmp3:", err.response?.data || err.message);
    msg.reply("❌ Gagal download audio.");
  }
};
