const axios = require("axios");

module.exports = {
  name: "dadjokes",
  description: "Ngasih dad joke random",
  async execute(client, msg) {
    try {
      const res = await axios.get("https://icanhazdadjoke.com/", {
        headers: { Accept: "application/json" },
      });
      msg.reply(` ${res.data.joke}`);
    } catch (err) {
      console.error("Error dadjokes:", err);
      msg.reply("your dad is getting some milk rn, hesnt here");
    }
  },
};
