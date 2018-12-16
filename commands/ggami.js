const responses = [
  {
    text: "멍멍 :dog:"
  },
  {
    text: ":smile:"
  },
  {
    text: ":sunglasses:"
  },
  {
    text: ":upside_down:"
  },
  {
    text: ":hugging:"
  },
  {
    text: ":yum:"
  },
  {
    text: ":relieved:"
  },
  {
    text: ":stuck_out_tongue_winking_eye:"
  }
];
const randomPuppy = require("random-puppy");

const handle = async ({ message, options, cmd }) => {
  const response = responses[Math.floor(Math.random() * responses.length)];
  if (response.image) {
  }
  const string = response.text;

  if (message.channel.type === "youtube") {
    return message.channel.send(string);
  }
  const puppy = await randomPuppy();
  //options.setDescription(string);
  options.setDescription(string + " Random Puppies!");
  options.setImage(puppy);
  return message.channel.send(options);
};

module.exports = {
  handle,
  prefix: {
    "!ggami": {
      match: "ggami",
      value: "!ggami ",
      lang: "en",
      display: "lang"
    },
    "!gam": {
      match: "ggami",
      value: "!gam ",
      lang: "en",
      display: false
    },
    "!까미": {
      match: "ggami",
      value: "!까미 ",
      lang: "ko",
      display: "lang"
    },
    "!dog": {
      match: "ggami",
      value: "!dog ",
      lang: "en",
      display: false
    },

    "!g": {
      match: "ggami",
      value: "!g ",
      lang: "en",
      display: false
    }
  },
  usage: "!ggami",
  description: "It's Ggami! 까미!",
  exampleUsage: "!까미",
  exampleResult: "-"
};
