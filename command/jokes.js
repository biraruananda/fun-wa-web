const axios = require("axios");

module.exports = {
  name: "jokes",
  description: "Ngasih jokes random",
  async execute(client, msg) {
    try {
      const res = await axios.get(
        "https://v2.jokeapi.dev/joke/Any?type=single"
      );
      const joke = res.data.joke || "im not funny today sorry";
      msg.reply(`${joke}`);
    } catch (err) {
      console.error("Error jokes:", err);
      msg.reply("not today sorry. the server are getting down");
    }
  },
};
