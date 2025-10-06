async function fakeTyping(chat, delay = 2000) {
  await chat.sendStateTyping();
  return new Promise((resolve) => {
    setTimeout(async () => {
      await chat.clearState();
      resolve();
    }, delay);
  });
}

module.exports = fakeTyping;
