const { MessageMedia } = require("whatsapp-web.js");
const fetch = require("node-fetch");

module.exports = async function imggen(client, msg) {
  const prompt = msg.body.slice(5).trim();
  if (!prompt) {
    msg.reply("Tulis prompt-nya, contoh:\n.img komi shouko in classroom");
    return;
  }

  msg.reply("🎨 Tunggu bentar, lagi gambar...");

  try {
    // encode prompt biar bisa dipakai di URL
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt
    )}`;

    // ambil hasil gambar dari Pollinations
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();

    const media = new MessageMedia(
      "image/jpeg",
      Buffer.from(buffer).toString("base64")
    );
    await client.sendMessage(msg.from, media, {
      caption: `🖼️ Prompt: ${prompt}`,
    });
  } catch (err) {
    console.error("Error generate gambar:", err);
    msg.reply("❌ Gagal generate gambar.");
  }
};
