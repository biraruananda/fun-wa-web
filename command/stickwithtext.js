const fs = require("fs");
const path = require("path");
const { MessageMedia } = require("whatsapp-web.js");
const sharp = require("sharp");

module.exports = async function stickWithText(client, msg) {
  try {
    let targetMsg = msg;
    if (msg.hasQuotedMsg) {
      targetMsg = await msg.getQuotedMessage();
    }

    if (!targetMsg.hasMedia) {
      return msg.reply(
        "❌ Kirim atau reply gambar dengan caption:\n\n.ss\n1.Teks atas\n2.Teks bawah"
      );
    }

    // Ambil teks caption setelah .ss
    let caption = msg.body.replace(/^\.ss\s*/i, "").trim();

    // Kalau kosong
    if (!caption) {
      return msg.reply(
        "❌ Tambahkan teks setelah .ss:\n\n1.Teks atas\n2.Teks bawah"
      );
    }

    // Deteksi format teks
    let topText = "";
    let bottomText = "";

    // kalau ada newline
    if (caption.includes("\n")) {
      const lines = caption
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      topText =
        lines
          .find((l) => l.startsWith("1."))
          ?.slice(2)
          .trim() || "";
      bottomText =
        lines
          .find((l) => l.startsWith("2."))
          ?.slice(2)
          .trim() || "";
    } else {
      // fallback kalo 1. dan 2. di satu baris
      const matchTop = caption.match(/1\.(.*?)2\./);
      if (matchTop) {
        topText = matchTop[1].trim();
        bottomText = caption.split("2.")[1]?.trim() || "";
      } else if (caption.startsWith("1.")) {
        topText = caption.slice(2).trim();
      } else if (caption.startsWith("2.")) {
        bottomText = caption.slice(2).trim();
      }
    }

    if (!topText && !bottomText) {
      return msg.reply(
        "❌ Format teks gak dikenali. Gunakan:\n1.Teks atas\n2.Teks bawah"
      );
    }

    // Download gambar
    const media = await targetMsg.downloadMedia();
    const tempId = Date.now();
    const inputPath = path.join(__dirname, `temp_${tempId}_input.png`);
    const outputPath = path.join(__dirname, `temp_${tempId}_output.png`);
    fs.writeFileSync(inputPath, Buffer.from(media.data, "base64"));

    const metadata = await sharp(inputPath).metadata();
    const width = metadata.width || 512;
    const height = metadata.height || 512;
    const fontSize = Math.floor(width / 8);
    const strokeWidth = Math.floor(fontSize / 8);

    // SVG teks atas & bawah
    const svgText = `
    <svg width="${width}" height="${height}">
      <style>
        .meme-text {
          fill: white;
          font-family: Impact, Arial Black, sans-serif;
          font-size: ${fontSize}px;
          font-weight: bold;
          text-anchor: middle;
          stroke: black;
          stroke-width: ${strokeWidth};
          paint-order: stroke fill;
        }
      </style>
      ${
        topText
          ? `<text x="50%" y="${
              fontSize + 10
            }" class="meme-text">${topText.toUpperCase()}</text>`
          : ""
      }
      ${
        bottomText
          ? `<text x="50%" y="${
              height - fontSize / 3
            }" class="meme-text">${bottomText.toUpperCase()}</text>`
          : ""
      }
    </svg>`;

    await sharp(inputPath)
      .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
      .toFile(outputPath);

    const memeMedia = MessageMedia.fromFilePath(outputPath);
    await client.sendMessage(msg.from, memeMedia, {
      sendMediaAsSticker: true,
      stickerAuthor: "Reinaa Pack",
      stickerName: "Reinaamee",
    });

    // bersihkan file sementara
    [inputPath, outputPath].forEach((f) => {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    });
  } catch (err) {
    console.error("stickWithText error:", err);
    msg.reply("❌ Gagal bikin stiker, pastikan format teksnya benar.");
  }
};
