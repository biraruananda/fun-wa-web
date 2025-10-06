function menumes(mentionId) {
  const hartang = Date.now();
  return `
╭━━━〔 🤖 *BOT MENU* 〕━━━╮
┃
┃  ➤ 👋 Hi @${mentionId}!
┃  ➤ ⏰ ${new Date(hartang).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })}
┃
┣━━━〔 📌 *Main* 〕━━━
┃  ➤ .help  – Lihat daftar menu
┃  ➤ .ping  – Cek respon bot
┃  ➤ .owner – Info pemilik bot
┃
┣━━━〔 🖼️ *sticker* 〕━━━
┃  ➤ .sticker / .s image ke stiker
┃     Buat stiker dari gambar
┃  ➤ .toimg <reply sticker>
┃     Ubah stiker ke gambar
┃  ➤ .sgif video/gif ke stiker
┃     Buat stiker dari video/GIF
┃  ➤ .ss 
┃     1.<teks atas>
┃     2.<teks bawah>
┃     Buat sticker meme teks di atas dan bawah
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
┃  ➤ .translate / .tl <kode> <teks>
┃     Translate bahasa (ketik .LangHelp untuk daftar kode)
┃  ➤ .quotes
┃     Dapatkan quotes random
┃  ➤ .ai <prompt>
┃     Tanya AI apapun dengan gpt-5
┃  ➤ .ais <prompt> 
┃     Tanya AI apapun dengan gemini-search
┃
┣━━━〔 📂 *Group* 〕━━━
┃  ➤ .linkgc  – Link grup
┃  ➤ .kick @tag – Kick member
┃  ➤ .promote @tag – Jadikan admin
┃  ➤ .demote @tag – Turunkan admin
┃  ➤ .mentall – tag all member
┃  ➤ .tagall – tag all member w/o text
┃
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
✨ _Gunakan perintah dengan bijak_ ✨
`;
}

module.exports = menumes;
