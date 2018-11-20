const Conjugator = require("universal-conjugator");
const koreanConjugator = Conjugator.create("korean");
const { getFirstTextAnalyze } = require("../resources/word-analyzer");
const { titleCase } = require("../utils/format-text");
const _ = require("underscore");
const handle = async ({ message, options, bot, prefix }) => {
  options.setThumbnail(
    "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/155/books_1f4da.png"
  );
  const errorTxt = `\nExample: \`\`\`${
    module.exports.exampleUsage
  }\`\`\` \nResult: \`\`\`${module.exports.exampleResult}\`\`\``;
  const usedPrefix = prefix.prefix[prefix.name];
  const prefixIndex = message.content.indexOf(usedPrefix.value);
  const msg = message.content.slice(prefixIndex + usedPrefix.value.length); // slice of the prefix on the message
  let args = msg.split(" "); // break the message into part by spaces
  let cmd = args[0].toLowerCase(); // set the first word as the command in lowercase just in case
  args.shift(); // delete the first word from the args
  if (cmd === "") {
    return message.channel.send(
      "Please provide a word to conjugate " + errorTxt
    );
  }
  let {
    englishWordType,
    koreanhWordType,
    koreanWord
  } = await getFirstTextAnalyze(cmd);
  if (koreanWord) {
    cmd = koreanWord;
  }

  const filteredAndSorted = allPossibles
    .filter(s => s.wordType === englishWordType)
    .map(info => {
      return {
        result: koreanConjugator.conjugate(cmd, info),
        info
      };
    });
  const tenses = _.groupBy(filteredAndSorted, cj => {
    return cj.info.tense;
  });
  Object.keys(tenses).forEach(tense => {
    let results = [];
    const uniqResults = _.uniq(tenses[tense], true, tense => {
      return tense.result;
    });
    uniqResults.forEach(res => {
      let { result, info } = res;
      const { tense, formality, wordType } = info;
      if (tense === "conditional") {
        results.push(`${result}***면*** *${formality}*`);
      } else {
        results.push(`${result} *${formality}*`);
      }
    });

    options.addField(`${titleCase(tense)}`, `${results.join("\n")}`, true);
  });

  options.setTitle(
    `${cmd} : (${koreanhWordType} ${titleCase(englishWordType)})`
  );
  if (message.channel.type === "youtube") {
    return message.channel.send(
      "The !conj command is only available for discord members. Maybe try again another time."
    );
  }
  return message.channel.send(options);
};

const allPossibles = [
  { tense: "subject", wordType: "noun" },
  { tense: "object", wordType: "noun" },
  { tense: "present", formality: "formal", wordType: "adjective" },
  { tense: "past", formality: "formal", wordType: "adjective" },
  { tense: "future", formality: "formal", wordType: "adjective" },
  { tense: "prepared", formality: "formal", wordType: "adjective" },
  { tense: "conditional", formality: "formal", wordType: "adjective" },
  { tense: "present", formality: "casual", wordType: "adjective" },
  { tense: "past", formality: "casual", wordType: "adjective" },
  { tense: "future", formality: "casual", wordType: "adjective" },
  { tense: "prepared", formality: "casual", wordType: "adjective" },
  { tense: "conditional", formality: "casual", wordType: "adjective" },
  { tense: "present", formality: "formal", wordType: "verb" },
  { tense: "past", formality: "formal", wordType: "verb" },
  { tense: "future", formality: "formal", wordType: "verb" },
  { tense: "present continuous", formality: "formal", wordType: "verb" },
  { tense: "conditional", formality: "formal", wordType: "verb" },
  { tense: "present", formality: "casual", wordType: "verb" },
  { tense: "past", formality: "casual", wordType: "verb" },
  { tense: "future", formality: "casual", wordType: "verb" },
  { tense: "present continuous", formality: "casual", wordType: "verb" },
  { tense: "conditional", formality: "casual", wordType: "verb" }
];

module.exports = {
  handle,
  prefix: {
    "!conjugate": {
      match: "conjugate",
      value: "!conjugate ",
      lang: "en",
      display: false
    },
    "!conj": {
      match: "conjugate",
      value: "!conj ",
      lang: "en",
      display: true
    }
  },
  usage: "!conj [word]",
  description: "Get conjugations for a given word",
  exampleUsage: "!conj 좋다",
  exampleResult: "좋어요 formal"
};
