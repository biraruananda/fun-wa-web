const fs = require("fs");
const path = require("path");

// command/aicom.js
module.exports = {
  ai: async (client, msg, ai, fakeTyping) => {
    const chat = await msg.getChat();
    const prompt = msg.body.slice(4).trim();
    if (!prompt) return msg.reply("Isi pesan setelah .ai");

    await fakeTyping(chat);
    const loadingMsg = await msg.reply("⏳ Tunggu respon AI...");

    try {
      const response = await ai.generate({
        model: "gemini-2.5-flash",
        prompt: prompt,
      });
      // output dari SDK bisa berbeda tergantung versi; berikut contoh akses
      const reply = response.text || response.choices?.[0]?.text || response;

      await loadingMsg.delete(true);
      if (!reply) return msg.reply("⚠️ Gak ada hasil dari AI.");
      await msg.reply(reply);
    } catch (err) {
      console.error("❌ Error di aicom:", err);
      await loadingMsg.delete(true);
      msg.reply("❌ AI error, coba lagi nanti.");
    }
  },

  ais: async (client, msg, openai, fakeTyping) => {
    const chat = await msg.getChat();
    const prompt = msg.body.slice(5).trim();
    if (!prompt) return msg.reply("pake message boy");

    await fakeTyping(chat);

    const loadingMessage = await msg.reply("⏳ tunggu respon ai...");

    try {
      const response = await openai.chat.completions.create({
        model: "gemini-search",
        messages: [{ role: "user", content: prompt }],
      });

      const reply = response.choices[0].message.content;
      await loadingMessage.delete(true);
      await msg.reply(reply);
    } catch (err) {
      console.error("ERROR AI:", err);
      await loadingMessage.delete(true);
      msg.reply("❌ search engine error");
    }
  },
};
