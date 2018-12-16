const handle = async ({ message, bot }) => {
  bot.fixBroadcast();
};

module.exports = {
  handle,
  name: "resume"
};
