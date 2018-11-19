const myUsername =
  process.env.NODE_ENV === "development"
    ? "Test Korean Dictionary"
    : "Korean Dictionary";
const io = require("../../next-server").io;
const db = require("../../firebase");
const constants = require("../../utils/constants");
const handle = async ({ message, bot }) => {
  // on message event
  if (message.author.bot || message.system) {
    // Ignore bots

    // check for if its KLP
    if (
      message.embeds &&
      message.embeds[0] &&
      message.embeds[0].author &&
      message.embeds[0].author.name == "Korean Listening Practice" &&
      message.author.username === myUsername
    ) {
      bot.lastKLPmessage = message;
      bot.KLPChannel = message.channel;
    }

    return;
  }
  let options = constants.GET_DEFAULT_MESSAGE_OPTIONS();
  const firstword = message.content.toLowerCase().split(" ")[0];
  const prefix = bot.commands.get(firstword);
  //const prefix = command ? command.prefix : null;
  if (prefix) {
    prefix.handle({ message, options, bot, io, prefix, db });
    // Message includes your prefix, not DM
    //return messageHasPrefix(message, options, prefix);
  } else if (isDM(message, bot)) {
    // Catch DM
    return messageHasDM(message, options);
  } else if (isMention(message, bot)) {
    // Catch @Mentions
    return messageHasMention(message, options);
  }
  return;
};

const isDM = message => message.channel && message.channel.type === "dm";
const isMention = (message, bot) =>
  message.content.indexOf("<@" + bot.user.id) === 0 ||
  message.content.indexOf("<@!" + bot.user.id) === 0;

const messageHasDM = (message, options) => {
  options.setDescription(constants.HELPER_TEXT);
  return message.channel.send(options);
};

const messageHasMention = (message, options) => {
  options.setDescription(constants.HELPER_TEXT);
  return message.channel.send(options);
};

module.exports = {
  handle,
  name: "message"
};
