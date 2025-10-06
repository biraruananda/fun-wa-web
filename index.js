require("dotenv").config();
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { OpenAI } = require("openai");
const fs = require("fs");
const path = require("path");

const {
  getUserProfile,
  updateLastActive,
  addXP,
} = require("./lib/profileManager");

// Import semua command
const stickWithText = require("./command/stickwithtext");
const pingcom = require("./command/ping");
const sticker = require("./command/sticker");
const ownercommand = require("./command/owner");
const menumes = require("./command/menu");
const gifSticker = require("./command/sgif");
const quotescom = require("./command/quotes");
const helpcom = require("./command/help");
const aicom = require("./command/aicom");
const imggen = require("./command/imggen");
const translatecom = require("./command/translate");
const langhelp = require("./command/langcode");
const tagall = require("./command/tagall");
const ytCommand = require("./command/yt");
const profile = require("./command/profile");
const wordleCmd = require("./command/wordle");
const uplevelCommand = require("./command/uplevel");
const myistriCmd = require("./command/myistri");

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => qrcode.generate(qr, { small: true }));
client.on("ready", () => console.log("✅ Bot siap digunakan!"));

// Fungsi delay ketikan palsu
async function fakeTyping(chat, min = 1000, max = 3000) {
  await chat.sendStateTyping();
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    setTimeout(async () => {
      await chat.clearState();
      resolve();
    }, delay);
  });
}

// Mapping command
const commands = {
  menu: async (client, msg) => {
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

    const media = MessageMedia.fromFilePath("./assets/author.png");
    const teks = menumes(mentionId);

    await client.sendMessage(msg.from, media, {
      caption: `${teks}\n\n🔗 https://www.whatsapp.com/channel/0029VbBKgJUDeONDM8f1lX0u`,
      mentions,
    });
  },

  help: helpcom,
  langhelp: (client, msg) => langhelp(client, msg, fakeTyping),
  ping: (client, msg) => pingcom(client, msg),
  owner: (client, msg) => ownercommand(client, msg, fakeTyping),
  quotes: (client, msg) => quotescom(client, msg, fakeTyping),
  s: (client, msg) => sticker(client, msg, fakeTyping),
  sticker: (client, msg) => sticker(client, msg, fakeTyping),
  sgif: (client, msg) => gifSticker(client, msg, fakeTyping),
  ss: (client, msg) => stickWithText(client, msg, fakeTyping),
  ai: (client, msg) => aicom.ai(client, msg, fakeTyping),
  ais: (client, msg) => aicom.ais(client, msg, fakeTyping),
  img: (client, msg) => imggen(client, msg, fakeTyping),
  tl: (client, msg) => translatecom(client, msg, fakeTyping),
  translate: (client, msg) => translatecom(client, msg, fakeTyping),
  tagall: (client, msg) => tagall(client, msg),
  jokes: (client, msg) => require("./command/jokes").execute(client, msg),
  dadjokes: (client, msg) => require("./command/dadjokes").execute(client, msg),
  ytmp3: (client, msg) => ytCommand(client, msg, fakeTyping),
  ytmp4: (client, msg) => ytCommand(client, msg, fakeTyping),
  wordle: (client, msg) => wordleCmd.start(client, msg, fakeTyping),
  w: (client, msg) => wordleCmd.guess(client, msg, fakeTyping),
  uplevel: (client, msg) => uplevelCommand(client, msg, fakeTyping),
  myistri: (client, msg) => myistriCmd.show(client, msg, fakeTyping),
  claim: (client, msg) => myistriCmd.claim(client, msg, fakeTyping),

  // Command profil dengan parameter userId
  myprofile: async (client, msg) => {
    const userId = msg.from.endsWith("@g.us") ? msg.author : msg.from;
    await profile(client, msg, userId, fakeTyping);
  },
  myp: async (client, msg) => {
    const userId = msg.from.endsWith("@g.us") ? msg.author : msg.from;
    await profile(client, msg, userId, fakeTyping);
  },
};

// Event utama
client.on("message", async (msg) => {
  if (!msg.body || !msg.body.startsWith(".")) return;

  const chat = await msg.getChat();
  const userId = msg.from.endsWith("@g.us") ? msg.author : msg.from;
  const commandName = msg.body.split(" ")[0].slice(1).toLowerCase();
  const handler = commands[commandName];

  if (!handler) {
    await msg.reply(
      "❌ Command tidak dikenal. Ketik *.menu* untuk daftar command."
    );
    return;
  }

  try {
    await fakeTyping(chat);

    // update profile/activity + beri XP
    try {
      updateLastActive(userId);
      // jangan beri +15 otomatis untuk sesi Wordle — Wordle menangani XP sendiri
      if (
        ![
          "wordle",
          "w",
          "menu",
          "help",
          "ping",
          "myprofile",
          "owner",
          "langhelp",
        ].includes(commandName)
      ) {
        addXP(userId, 5);
      }
    } catch (e) {
      console.warn("Warning: gagal update profile/xp:", e.message);
    }

    // jalankan handler, pass userId juga
    await handler(client, msg, userId);
  } catch (err) {
    console.error(`❌ Error di command ${commandName}:`, err);
    await msg.reply("⚠️ Terjadi kesalahan saat menjalankan command.");
  }
});

client.initialize();
