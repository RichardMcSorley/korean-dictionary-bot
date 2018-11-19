const constants = require("../utils/constants");
const handle = ({ message, options, bot }) => {
  let commandString = "";
  bot.commands
    .array()
    .filter(({ name }) => name !== "!admin")
    .forEach(({ name }) => {
      commandString += ` ${name} `;
    });
  //bot.commands.tap(command => console.log(command));
  if (message.channel.type === "youtube") {
    return message.channel.send("Available commands:" + commandString);
  }
  options.setTitle("Here are all the my commands:");
  options.setDescription(constants.HELPER_TEXT);
  return message.channel.send("Available commands:" + commandString);
};

module.exports = {
  handle,
  prefix: {
    "!help": {
      match: "help",
      value: "!help ",
      lang: "en"
    },
    "!command": {
      match: "help",
      value: "!command ",
      lang: "en"
    },
    "!commands": {
      match: "help",
      value: "!commands ",
      lang: "en"
    }
  }
};
