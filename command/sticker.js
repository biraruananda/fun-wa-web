// command/sticker.js
module.exports = async function sticker(client, msg) {
  try {
    const getTargetMedia = async () => {
      if (msg.hasMedia) return msg;
      if (msg.hasQuotedMsg) {
        const quotedMsg = await msg.getQuotedMessage();
        if (quotedMsg.hasMedia) return quotedMsg;
      }
      return null;
    };

    const targetMsg = await getTargetMedia();
    if (!targetMsg) return msg.reply("❌ Kirim/reply gambar dengan caption !s");

    const media = await targetMsg.downloadMedia();
    await client.sendMessage(msg.from, media, {
      sendMediaAsSticker: true,
      stickerAuthor: "Reinaa Pack",
      stickerName: "Reinaamee",
    });
  } catch (err) {
    console.error("Sticker error:", err);
    const errMsg = err && err.message ? err.message : String(err);
    try {
      await msg.reply("❌ Gagal bikin stiker: " + errMsg);
    } catch (_) {}
  }
};
