const axios = require("axios");

async function getQuotes() {
  try {
    const res = await axios.get("https://zenquotes.io/api/random");
    const q = res.data[0];
    return `"${q.q}" — ${q.a}`;
  } catch (err) {
    console.error("Error fetching quotes:", err);
    return "❌ Gagal mengambil quotes. Coba lagi nanti.";
  }
}

module.exports = async function quotescom(client, msg) {
  await msg.reply("🔍 Mencari quotes...");
  const quote = await getQuotes();
  await msg.reply(quote);
};
