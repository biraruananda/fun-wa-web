const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = {
  ai: async (client, msg, fakeTyping) => {
    // Removed 'ai' from params since we'll initialize it here
    const chat = await msg.getChat();
    const userPrompt = msg.body.slice(4).trim(); // Changed 'prompt' to 'userPrompt' for clarity

    if (!userPrompt) {
      return msg.reply("Please provide a message after .ai");
    }

    await fakeTyping(chat);
    const loadingMsg = await msg.reply("⏳ Getting AI response..."); // More general loading message

    try {
      // Initialize the Google Generative AI client
      // IMPORTANT: Replace 'YOUR_API_KEY' with your actual Gemini API key
      const genAI = new GoogleGenerativeAI(
        process.env.GEMINI_API_KEY || "YOUR_API_KEY"
      );
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const text = response.text();

      await loadingMsg.delete(true);
      if (!text) {
        return msg.reply("⚠️ No response from AI.");
      }
      await msg.reply(text);
    } catch (err) {
      console.error("❌ Error in AI command:", err);
      await loadingMsg.delete(true);
      msg.reply("❌ AI error, please try again later.");
    }
  },
  ais: async (client, msg, fakeTyping) => {
    const text = `Lagi maintance, coba lagi nanti. atau pake .ai`;
    msg.reply(text);
  },
};
