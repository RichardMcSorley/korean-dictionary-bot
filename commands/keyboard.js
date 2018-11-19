const keyboard = require("gksdud");
const errorTxt = "\nEX: ```!keyboard dkssud```";
const handle = ({ message, options, bot, prefix }) => {
  const usedPrefix = prefix.prefix[prefix.name];
  const prefixIndex = message.content.indexOf(usedPrefix.value);
  const msg = message.content.slice(prefixIndex + usedPrefix.value.length); // slice of the prefix on the message
  let string = "";
  if (msg === "") {
    string = "Sorry you have to type something." + errorTxt;
    if (message.channel.type === "youtube") {
      return message.channel.send(string);
    }
    options.setDescription(string);
    return message.channel.send(options);
  }
  if (message.lang === "en") {
    string = "Result: " + keyboard(msg);
  } else {
    string =
      "Looks like you are typing in korean already. No need for me ^^" +
      errorTxt;
  }

  if (message.channel.type === "youtube") {
    return message.channel.send(string);
  }
  options.setDescription(string);
  return message.channel.send(options);
};

module.exports = {
  handle,
  prefix: {
    "!keyboard": {
      match: "keyboard",
      value: "!keyboard ",
      lang: "en",
      display: true
    }
  },
  usage: "!keyboard [text]",
  description: "Know where the keys are for Korean but can't type? Use this!",
  exampleUsage: "!keyboard dkssud",
  exampleResult: "Result: 안녕"
};
