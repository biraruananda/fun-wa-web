const fs = require("fs");
const path = require("path");
module.exports = {
  ai: async (client, msg, openai, fakeTyping) => {
    const chat = await msg.getChat();
    const prompt = msg.body.slice(4).trim();
    if (!prompt) {
      msg.reply("Isi pesan setelah .ai");
      return;
    }

    await fakeTyping(chat);

    const loadingMessage = await msg.reply("⏳ tunggu respon ai...");

    await fakeTyping(chat);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5-chat",
        messages: [{ role: "user", content: prompt }],
      });

      const reply = response.choices[0].message.content;
      loadingMessage.delete();
      msg.reply(reply);
    } catch (err) {
      console.error("Error AI:", err);
      msg.reply("❌ gipiptinya error bang");
    }
  },

  ais: async (client, msg, openai, fakeTyping) => {
    const chat = await msg.getChat();
    const prompt = msg.body.slice(5).trim();
    if (!prompt) {
      msg.reply("pake message boy");
      return;
    }

    await fakeTyping(chat);

    await msg.reply("⏳ tunggu respon ai...");

    await fakeTyping(chat);

    try {
      const response = await openai.chat.completions.create({
        model: "gemini-search",
        messages: [{ role: "user", content: prompt }],
      });

      const reply = response.choices[0].message.content;
      msg.reply(reply);
    } catch (err) {
      console.error("ERROR AI:", err);
      msg.reply("❌ search engine error");
    }
  },
};
