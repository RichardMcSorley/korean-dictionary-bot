const { numberToKorean } = require("number-to-korean");
const kpop = require("kpop");
const koreanToNumber = require("korean-numbers");
var numeral = require("numeral");
const errorTxt = "\nEX: ```!number 3000```";
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
  if (message.lang === "ko") {
    const englishNbr = koreanToNumber.parse(msg);
    string = `In English **${msg}** - ${kpop.romanize(
      msg.replace(/\d/, "")
    )} is **${numeral(englishNbr).format("0,0")}**`;
  } else {
    const koreanNbr = numberToKorean(msg);
    string = `In Korean **${msg}** is **${koreanNbr}** - ${kpop.romanize(
      koreanNbr.replace(/\d/, "")
    )}`;
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
    "!number": {
      match: "number",
      value: "!number ",
      lang: "en",
      display: true
    }
  }
};
