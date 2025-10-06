module.exports = async function translatecom(client, msg, openai, fakeTyping) {
  const chat = await msg.getChat();
  const body = msg.body.trim();

  // format: .tl <kode_bahasa> <teks>
  const parts = body.split(" ");
  if (parts.length < 3) {
    await msg.reply(
      "📘 Format: `.tl <kode_bahasa> <teks>`\nContoh: `.tl en aku lapar`"
    );
    return;
  }

  const targetLang = parts[1];
  const text = parts.slice(2).join(" ");

  await msg.reply("🔄 Menerjemahkan... tunggu ya");
  await fakeTyping(chat);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-chat", // tetap pakai model dari LLM7
      messages: [
        {
          role: "system",
          content: `You are a translation assistant. Translate the following text into ${targetLang}.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const translated = response.choices[0].message.content;
    await msg.reply(`🌐 Hasil terjemahan (${targetLang}):\n\n${translated}`);
  } catch (err) {
    console.error("Translate error:", err);
    await msg.reply("❌ Gagal menerjemahkan teks.");
  }
};
