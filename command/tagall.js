module.exports = async function tagall(client, msg) {
  const chat = await msg.getChat();

  const text = msg.body.slice(7).trim();
  let mentions = [];
  let message = text || "‎";

  for (let participant of chat.participants) {
    mentions.push(participant.id._serialized);
  }

  await chat.sendMessage(message, { mentions });
};
