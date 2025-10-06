const ownerinfo = require("../config/ownerinfo");

async function ownercommand(client, msg) {
  const chat = await msg.getChat();

  const teks = `
╭━━━〔 *Bot Owner Info* 〕━━━╮
┃
┃ ➤ *Nama:* ${ownerinfo.name}
┃ ➤ *Nomor:* https://wa.me/${ownerinfo.number}
┃ ➤ *Github:* ${ownerinfo.github}
┃ ➤ *Instagram:* ${ownerinfo.instagram}
┃
╰━━━〔 *Bot Owner Info* 〕━━╯

Jangan lupa save nomor owner biar bisa tanya-tanya langsung.`;

  const mentions = [`${ownerinfo.number}@c.us`];

  await chat.sendMessage(teks, { mentions });
}

module.exports = ownercommand;
