// command/myistri.js
const { MessageMedia } = require("whatsapp-web.js");
const { setWaifu } = require("../lib/profileManager");
const {
  setLastShown,
  getLastShown,
  clearLastShown,
} = require("../lib/waifuManager");

let fetchFn;
try {
  fetchFn = globalThis.fetch || require("node-fetch");
} catch (e) {
  fetchFn = globalThis.fetch; // may be undefined, handle later
}

function computeUserIdFromMsg(msg) {
  return msg.from && msg.from.endsWith && msg.from.endsWith("@g.us")
    ? msg.author
    : msg.from;
}

/**
 * .myistri -> ambil random waifu dari waifu.im dan kirim (image + caption)
 */
module.exports.show = async (client, msg, fakeTyping) => {
  try {
    if (!fetchFn) {
      await msg.reply(
        "❌ Bot tidak punya fungsi fetch. Install node-fetch atau gunakan Node 18+."
      );
      return;
    }

    // panggil API waifu.im
    // endpoint: https://api.waifu.im/search (mengembalikan JSON dengan array images)
    const res = await fetchFn("https://api.waifu.im/search", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      await msg.reply("❌ Gagal mengambil waifu dari API.");
      return;
    }
    const body = await res.json();

    if (!body || !Array.isArray(body.images) || body.images.length === 0) {
      await msg.reply(
        "❌ API waifu.im tidak mengembalikan gambar. Coba lagi nanti."
      );
      return;
    }

    // ambil satu random dari array yang dikembalikan
    const imageObj =
      body.images[Math.floor(Math.random() * body.images.length)];

    // coba ambil beberapa metadata yang mungkin ada
    // struktur API bisa berbeda; gunakan safe access
    const imageUrl = imageObj.url || imageObj.image || imageObj.src || null;
    const name =
      (imageObj.character && (imageObj.character.name || imageObj.character)) ||
      imageObj.character_name ||
      imageObj.name ||
      null;
    const anime =
      imageObj.anime ||
      (imageObj.character && imageObj.character.anime) ||
      null;
    const sourceId = imageObj.id || imageObj.hash || null;

    // simpan last shown untuk user (agar .claim tahu yang di-claim)
    const userId = computeUserIdFromMsg(msg);
    setLastShown(userId, { name, anime, imageUrl, sourceId });

    // kirim image (gunakan MessageMedia.fromUrl)
    try {
      const media = await MessageMedia.fromUrl(imageUrl);
      const captionParts = [];
      captionParts.push("🌸 *Random Waifu*");
      if (name) captionParts.push(`➤ Name: *${name}*`);
      if (anime) captionParts.push(`➤ Anime: ${anime}`);
      captionParts.push(
        "\nKetik `.claim` untuk menyimpan waifu ini ke profilmu."
      );
      const caption = captionParts.join("\n");
      await fakeTyping(await msg.getChat());
      await client.sendMessage(msg.from, media, { caption });
    } catch (e) {
      // fallback bila fail kirim media: kirim url + info
      await fakeTyping(await msg.getChat());
      let text = `🌸 *Random Waifu*`;
      if (name) text += `\n➤ Name: *${name}*`;
      if (anime) text += `\n➤ Anime: ${anime}`;
      if (imageUrl) text += `\n\nImage: ${imageUrl}`;
      text += `\n\nKetik \`.claim\` untuk menyimpan waifu ini ke profilmu.`;
      await msg.reply(text);
    }
  } catch (err) {
    console.error("myistri.show error:", err);
    try {
      await msg.reply("❌ Terjadi kesalahan saat mengambil waifu.");
    } catch {}
  }
};

/**
 * .claim -> ambil last shown waifu untuk user dan simpan ke profile
 */
module.exports.claim = async (client, msg, fakeTyping) => {
  try {
    const userId = computeUserIdFromMsg(msg);
    const last = getLastShown(userId);
    if (!last) {
      await msg.reply(
        "❌ Tidak ada waifu yang bisa di-claim. Pertama tampilkan dengan `.myistri`."
      );
      return;
    }

    // simpan ke profile
    const waifuObj = {
      name: last.name || "Unknown",
      anime: last.anime || null,
      imageUrl: last.imageUrl || null,
      claimedAt: new Date().toISOString(),
      sourceId: last.sourceId || null,
    };

    setWaifu(userId, waifuObj);
    // hapus session lastShown (opsional)
    clearLastShown(userId);

    await fakeTyping(await msg.getChat());
    await msg.reply(
      `✅ Berhasil claim waifu!` +
        `\n➤ Name: *${waifuObj.name}*` +
        (waifuObj.anime ? `\n➤ Anime: ${waifuObj.anime}` : "") +
        `\n\nWaifu ini telah tersimpan di profilmu.`
    );
  } catch (err) {
    console.error("myistri.claim error:", err);
    try {
      await msg.reply("❌ Terjadi kesalahan saat meng-claim waifu.");
    } catch {}
  }
};
