module.exports = async function helpcom(client, msg) {
  const chat = await msg.getChat();
  let mentions = [];
  let mentionId;

  if (chat.isGroup) {
    mentionId = msg.author.split("@")[0];
    mentions = [msg.author];
  } else {
    mentionId = msg.from.split("@")[0];
    mentions = [msg.from];
  }

  const hartang = Date.now();
  const helpText = `
╭━━━〔 📚 *Help* 〕━━━╮
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
┃  ➤ .menu   – Tampilkan menu
┃  ➤ .help   – Tampilkan bantuan
┃  ➤ .ping   – Cek respon bot
┃  ➤ .quotes – Dapatkan quotes random
┃  ➤ .owner  – Info pemilik bot
┃  ➤ .LangHelp – Tampilkan daftar kode bahasa
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
`;

  await chat.sendMessage(helpText, { mentions });
};
