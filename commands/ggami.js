const handle = ({ message, options, cmd }) => {
  const string = "멍멍 :dog: ";
  if (message.channel.type === "youtube") {
    return message.channel.send(string);
  }
  options.setDescription(string);
  return message.channel.send(options);
};

module.exports = {
  handle,
  prefix: {
    "!ggami": {
      match: "ggami",
      description: "What are you doing, Ggami?",
      value: "!ggami ",
      lang: "en",
      display: "lang"
    },
    "!까미": {
      match: "ggami",
      value: "!까미 ",
      description: "까미~ 뭐해?",
      lang: "ko",
      display: "lang"
    }
  }
};
