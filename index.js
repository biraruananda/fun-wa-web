require("dotenv").config();
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { OpenAI } = require("openai");
const fs = require("fs");

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

const client = new Client({
  authStrategy: new LocalAuth(),
});

const openai = new OpenAI({
  apiKey: process.env.LLM7_API_KEY,
  baseURL: process.env.LLM7_BASE_URL,
});

client.on("qr", (qr) => qrcode.generate(qr, { small: true }));
client.on("ready", () => console.log("✅ Bot siap digunakan!"));

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

// 🔥 Command router (list command)
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
      caption: `${teks}\n\n🔗 https://www.whatsapp.com/channel/0029VbBKgJUDeONDM8f1lX0u `,
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
  ai: (client, msg) => aicom.ai(client, msg, openai, fakeTyping),
  ais: (client, msg) => aicom.ais(client, msg, openai, fakeTyping),
  img: (client, msg) => imggen(client, msg, fakeTyping),
  tl: (client, msg) => translatecom(client, msg, openai, fakeTyping),
  translate: (client, msg) => translatecom(client, msg, openai, fakeTyping),
  tagall: (client, msg) => tagall(client, msg),
  jokes: (client, msg) => require("./command/jokes").execute(client, msg),
  dadjokes: (client, msg) => require("./command/dadjokes").execute(client, msg),
  ytmp3: (client, msg) => ytCommand(client, msg, fakeTyping),
  ytmp4: (client, msg) => ytCommand(client, msg, fakeTyping),
};

client.on("message", async (msg) => {
  if (msg.body.startsWith(".")) {
    const chat = await msg.getChat();
    const sender = msg.from;
    const isGroup = chat.isGroup;
    const senderName = isGroup ? msg.author || "Unknown" : sender;

    const commandName = msg.body.split(" ")[0].slice(1).toLowerCase();
    const handler = commands[commandName];

    if (handler) {
      try {
        await fakeTyping(chat);

        // Patch khusus untuk .ai — simpan hanya output AI ke log
        if (commandName === "ai") {
          const oldReply = msg.reply;
          msg.reply = async (text, ...args) => {
            const replyText =
              typeof text === "string" ? text : "[Non-text reply]";
            console.log(`🤖 AI Reply: ${replyText}`);

            // simpan output AI ke file log
            fs.appendFileSync(
              "ai_log.txt",
              `[${new Date().toLocaleString()}] ${replyText}\n\n`
            );

            return await oldReply.call(msg, text, ...args);
          };
        }

        await handler(client, msg);
      } catch (err) {
        console.error(`❌ Error di command ${commandName}:`, err);
        msg.reply("⚠️ Command ini belum beres/dibuat.");
      }
    } else {
      msg.reply("❌ Command tidak dikenal. Ketik .menu untuk daftar command.");
    }
  }
});

client.initialize();
