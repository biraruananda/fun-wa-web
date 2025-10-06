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

    await msg.reply("⏳ tunggu respon ai...");

    const logPath = path.join(__dirname, "../ai_log.txt");

    let memory = "";
    if (fs.existsSync(logPath)) {
      const lines = fs.readFileSync(logPath, "utf-8").trim().split("\n");
      const lastLines = lines.slice(-10).join("\n");
      memory = `Berikut beberapa respon AI sebelumnya:\n${lastLines}\n\n`;
    }

    await fakeTyping(chat);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5-chat",
        messages: [
          {
            role: "system",
            content: "Kamu adalah bot yang punya memori obrolan sebelumnya.",
          },
          { role: "user", content: prompt },
          { role: "user", content: memory },
        ],
      });

      const reply = response.choices[0].message.content;
      msg.reply(reply);
      fs.appendFileSync(logPath, `[${new Date().toLocaleString()}] ${reply}\n`);
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
