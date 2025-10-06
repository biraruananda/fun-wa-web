module.exports = async function pingcom(client, msg) {
  const start = Date.now();
  await msg.reply("⏳ Ngetes ping...");
  const delay = Date.now() - start;
  await msg.reply(`🏓 Pong! Respon dalam ${delay}ms`);
};
