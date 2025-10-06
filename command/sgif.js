const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { MessageMedia } = require("whatsapp-web.js");
const crypto = require("crypto");

module.exports = async function gifSticker(client, msg) {
  const getTargetMedia = async () => {
    if (msg.hasMedia) return msg;
    if (msg.hasQuotedMsg) {
      const quotedMsg = await msg.getQuotedMessage();
      if (quotedMsg.hasMedia) return quotedMsg;
    }
    return null;
  };

  if (msg.body.startsWith(".sgif")) {
    const targetMsg = await getTargetMedia();
    if (!targetMsg)
      return msg.reply(
        "❌ Kirim/reply media bergerak (GIF/MP4/WEBP) dengan caption .sgif"
      );

    try {
      let media = await targetMsg.downloadMedia();
      
      // If media is null, try alternative download method
      if (!media && targetMsg._data && targetMsg._data.body) {
        console.log("Trying alternative media download...");
        // Sometimes media exists in _data but not in downloadMedia()
        media = targetMsg._data;
      }

      if (!media || !media.data) {
        return msg.reply(
          "❌ Media gagal diambil. Coba kirim ulang file atau gunakan file yang berbeda."
        );
      }

      const supportedTypes = ["image/gif", "video/mp4", "image/webp"];
      if (!supportedTypes.includes(media.mimetype)) {
        return msg.reply(
          `❌ Format tidak didukung! Gunakan: ${supportedTypes.join(", ")}`
        );
      }

      const tempId = Date.now() + crypto.randomInt(1000, 9999);
      const ext = media.mimetype.split("/")[1];
      const tempInput = path.join(process.cwd(), `temp_${tempId}_input.${ext}`);
      const tempOutput = path.join(process.cwd(), `temp_${tempId}_output.webp`);

      // Write input file
      const fileBuffer = Buffer.from(media.data, 'base64');
      
      // Add random data to make each file unique even if source is same
      const randomBytes = crypto.randomBytes(16);
      const uniqueBuffer = Buffer.concat([fileBuffer, randomBytes]);
      
      fs.writeFileSync(tempInput, fileBuffer);

      // Generate unique parameters for each conversion
      const uniqueParams = {
        // Random scale between 500-520
        scale: 500 + crypto.randomInt(0, 21),
        // Random FPS
        fps: crypto.randomInt(10, 16),
        // Random quality
        quality: crypto.randomInt(75, 91),
        // Random compression
        compression: crypto.randomInt(4, 7),
        // Random start time offset (for videos)
        startTime: crypto.randomInt(0, 3),
        // Random duration variation
        duration: crypto.randomInt(5, 8)
      };

      console.log(`Using unique params:`, uniqueParams);

      await new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg(tempInput);
        
        // For videos, add random start time to create variation
        if (media.mimetype === "video/mp4") {
          ffmpegCommand.seekInput(uniqueParams.startTime);
          ffmpegCommand.duration(uniqueParams.duration);
        }

        // Build filter chain
        let filterChain = `scale=${uniqueParams.scale}:${uniqueParams.scale}:force_original_aspect_ratio=decrease,format=yuva420p,pad=${uniqueParams.scale}:${uniqueParams.scale}:(ow-iw)/2:(oh-ih)/2:color=white@0`;
        
        // Add random color adjustments
        const brightness = (crypto.randomInt(98, 103) / 100).toFixed(2);
        const saturation = (crypto.randomInt(95, 106) / 100).toFixed(2);
        filterChain += `,eq=brightness=${brightness}:saturation=${saturation}`;

        // Randomly add slight noise
        if (crypto.randomInt(0, 2) === 1) {
          filterChain += `,noise=alls=0.5:allf=t`;
        }

        ffmpegCommand
          .outputOptions([
            "-vf", filterChain,
            "-r", uniqueParams.fps.toString(),
            "-loop", "0",
            "-preset", "picture",
            "-quality", uniqueParams.quality.toString(),
            "-compression_level", uniqueParams.compression.toString(),
            "-an",
            "-vsync", "0"
          ])
          .outputFormat('webp')
          .on("start", (cmd) => console.log(`FFmpeg command: ${cmd}`))
          .on("end", () => {
            console.log("FFmpeg processing completed");
            resolve();
          })
          .on("error", (err) => {
            console.error("FFmpeg error:", err);
            reject(err);
          })
          .save(tempOutput);
      });

      if (!fs.existsSync(tempOutput)) {
        throw new Error("FFmpeg failed to create output file");
      }

      const webpData = fs.readFileSync(tempOutput);
      const webpBase64 = webpData.toString("base64");
      const stickerMedia = new MessageMedia("image/webp", webpBase64);

      await client.sendMessage(msg.from, stickerMedia, {
        sendMediaAsSticker: true,
        stickerAuthor: "Reinaa Pack",
        stickerName: "Reinaamee",
      });

      console.log(`🎬 Unique sticker created and sent to ${msg.from}`);
      
    } catch (error) {
      console.error("Error creating sticker:", error);
      msg.reply("❌ Gagal membuat stiker. Coba gunakan file yang berbeda atau format lain.");
    } finally {
      // Cleanup any temp files
      const tempFiles = [
        path.join(process.cwd(), `temp_*_input.*`),
        path.join(process.cwd(), `temp_*_output.webp`)
      ];
      
      tempFiles.forEach(pattern => {
        const files = fs.readdirSync(process.cwd()).filter(f => f.includes('temp_'));
        files.forEach(file => {
          try {
            fs.unlinkSync(path.join(process.cwd(), file));
          } catch (e) {
            // Ignore cleanup errors
          }
        });
      });
    }
    return;
  }
};