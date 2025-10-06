async function sendMenu(chat) {
  const menu = `
╭━━━〔 🤖 *BOT MENU* 〕━━━╮
┃
┃  👋 Hi! Berikut daftar command populer:
┃
┣━━━〔 📌 *Main* 〕━━━
┃  ➤ .help  – Lihat daftar menu
┃  ➤ .ping  – Cek respon bot
┃  ➤ .owner – Info pemilik bot
┃
┣━━━〔 🎮 *Fun* 〕━━━
┃  ➤ .sticker <reply img/vid>
┃     Buat stiker dari gambar/video
┃  ➤ .toimg <reply sticker>
┃     Ubah stiker ke gambar
┃  ➤ .quotes
┃     Random quote keren
┃
┣━━━〔 🔍 *Search* 〕━━━
┃  ➤ .yt <judul>
┃     Cari video YouTube
┃  ➤ .gimage <query>
┃     Cari gambar Google
┃  ➤ .play <judul lagu>
┃     Download lagu dari YouTube
┃
┣━━━〔 🛠 *Tools* 〕━━━
┃  ➤ .tts <teks>
┃     Ubah teks ke suara
┃  ➤ .translate <kode> <teks>
┃     Translate bahasa
┃  ➤ .ai <prompt>
┃     Tanya AI apapun
┃
┣━━━〔 📂 *Group* 〕━━━
┃  ➤ .linkgc  – Link grup
┃  ➤ .kick @tag – Kick member
┃  ➤ .promote @tag – Jadikan admin
┃  ➤ .demote @tag – Turunkan admin
┃  ➤ .mentall – tag all member
┃
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
✨ _Gunakan perintah dengan bijak_ ✨
`;

  const hiddenLink =
    "https://whatsapp.com/channel/0029VbBKgJUDeONDM8f1lX0u\u200B";

  await chat.sendMessage(menu + "\n\n" + hiddenLink);
}

require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { OpenAI } = require("openai");

const client = new Client({
  authStrategy: new LocalAuth(),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

client.on("qr", (qr) => qrcode.generate(qr, { small: true }));
client.on("ready", () => console.log("✅ Bot siap digunakan!"));

client.on("message", async (msg) => {
  if (msg.body.startsWith(".ai ")) {
    const prompt = msg.body.slice(4); // ambil teks setelah ".ai "

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // bisa ganti ke "gpt-4o-mini" kalo support
        messages: [{ role: "user", content: prompt }],
      });

      const reply = completion.choices[0].message.content;
      msg.reply(reply);
    } catch (err) {
      console.error(err);
      msg.reply("Terjadi kesalahan saat menghubungi AI.");
    }
  }

  if (msg.body === ".ping") {
    msg.reply("hurung");
  }
});

client.initialize();

///---- ai
 if (msg.body.startsWith(".ai ")) {
    const prompt = msg.body.slice(4).trim();
    if (!prompt) {
      msg.reply("❌ Tolong isi pesan setelah `.ai`");
      return;
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5-chat",
        messages: [{ role: "user", content: prompt }],
      });

      const reply = response.choices[0].message.content;
      msg.reply(reply);
    } catch (err) {
      console.error("Error AI:", err);
      msg.reply("❌ Terjadi kesalahan saat memproses AI.");
    }
  }