module.exports = async function langhelp(client, msg, fakeTyping) {
  const chat = await msg.getChat();
  await fakeTyping(chat);

  const helpText = `
╭━━━〔 🌐 *Language Codes* 〕━━━╮
┃  ➤ en  – English
┃  ➤ id  – Indonesian
┃  ➤ es  – Spanish
┃  ➤ fr  – French
┃  ➤ de  – German
┃  ➤ ja  – Japanese
┃  ➤ ko  – Korean
┃  ➤ zh  – Chinese
┃  ➤ ar  – Arabic
┃  ➤ ru  – Russian
┃  ➤ it  – Italian
┃  ➤ pt  – Portuguese
┃  ➤ th  – Thai
┃  ➤ vi  – Vietnamese
┃  ➤ ms  – Malay
┃  ➤ tl  – Tagalog
╰━━━━━━━━━━━━━━━━━━━━━━╯

📝 *Cara pakai:*
.tl [kode_bahasa] [teks]

💡 *Contoh:*
.tl ja aku lapar
→ 私はお腹が空いています
`;

  msg.reply(helpText.trim());
};
