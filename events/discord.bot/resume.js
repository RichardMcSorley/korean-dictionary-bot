const handle = async ({ message, bot }) => {
  bot.prepareKLPChannel();
};

module.exports = {
  handle,
  name: "resume"
};
