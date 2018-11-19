const constants = require("../utils/constants");
const handle = ({ message, options, bot }) => {
  let commandString = "";
  bot.commands
    .array()
    .filter(
      ({ display, lang }) =>
        display === true || (display === "lang" && message.lang === lang)
    )
    .forEach(({ name }) => {
      commandString += ` ${name} `;
    });
  //bot.commands.tap(command => console.log(command));
  if (message.channel.type === "youtube") {
    return message.channel.send("Available commands:" + commandString);
  }
  options.setDescription("Available commands:" + commandString);
  return message.channel.send(options);
};

module.exports = {
  handle,
  prefix: {
    "!help": {
      match: "help",
      value: "!help ",
      lang: "en",
      display: false
    },
    "!command": {
      match: "help",
      value: "!command ",
      lang: "en",
      display: false
    },
    "!commands": {
      match: "help",
      value: "!commands ",
      lang: "en",
      display: false
    }
  }
};
