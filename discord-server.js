const Discord = require("discord.js");
const naverAPI = require("./resources/naver-api");
const io = require("./next-server").io;
const db = require("./firebase/index");
const ytdl = require("ytdl-core");
const util = require("util");
const constants = require("./utils/constants");
const format = require("./utils/format-text");
const webhooks = require("./webhooks/index");
const bot = new Discord.Client({
  disableEveryone: true,
  disabledEvents: ["TYPING_START"]
});

bot.login(process.env.KOREAN_DICT_BOT_DISCORD_TOKEN);
const broadcastState = {
  broadcast: bot.createVoiceBroadcast(),
  paused: false,
  currentAudio: null,
  currentInfo: null,
  time: null
};
broadcastState.broadcast.on("subscribe", dispatcher => {
  console.log("New broadcast subscriber!");
});

broadcastState.broadcast.on("unsubscribe", dispatcher => {
  console.log("Channel unsubscribed from broadcast :(");
});

broadcastState.broadcast.on("end", () => playNextSong());
broadcastState.broadcast.on("error", () => playNextSong());

// use fire for admin purposes, in discord use !define eval fire('restart') to restart the server
const fire = action => {
  const { spawn } = require("child_process");
  switch (action) {
    case "restart":
      const subprocess = spawn(process.argv[0], process.argv.slice(1), { // spawn new process
        detached: true,
        stdio: ["ignore"]
      });
      subprocess.unref();
      fire("shutdown"); // close this process
      return "restarting";
    case "shutdown":
      process.exit();
      return "shutdown";
    case "skip": // run end on broadcast should playNextSong()
      broadcastState.broadcast.end();
      return "skipping";
    case "pause": // pause broadcast
      broadcastState.broadcast.pause();
      return "pausing";
    case "resume": // resume broadcast
      broadcastState.broadcast.resume();
      return "resuming";
    default:
      return "please provide an action";
  }
};

const message = async message => {
  // on message event
  if (message.author.bot || message.system) {
    // Ignore bots
    return;
  }
  let options = constants.GET_DEFAULT_MESSAGE_OPTIONS();
  const prefix = constants.GET_DISCORD_PREFIX(message.content);
  if (prefix) {
    // Message includes your prefix, not DM
    return messageHasPrefix(message, options);
  } else if (constants.isDM(message, bot)) {
    // Catch DM
    return messageHasDM(message, options);
  } else if (constants.isMention(message, bot)) {
    // Catch @Mentions
    return messageHasMention(message, options);
  }
  return;
};

const ready = async () => {
  bot.user.setActivity("Looking up words!");
  playNextSong();
  const channel = bot.channels.get(process.env.INITIAL_VOICE_CHANNEL); //hardcoded for now
  connectToBroadcast(channel);
  console.log(
    `Bot is online!\n${bot.users.size} users, in ${
      bot.guilds.size
    } servers connected.`
  );
};
const connectToBroadcast = channel => {
  if (!channel) return console.error("The channel does not exist!");
  // join channel
  channel
    .join()
    .then(connection => connection.playBroadcast(broadcastState.broadcast))
    .catch(err => console.log("could not join audio channel", err));
};

const playNextSong = async () => {
  const audio = await getNextAudio();
  if (audio === null) {
    playNextSong(); // try again
  } else {
    playAudioToBroadcast(audio);
  }
};

const getNextAudio = async () => {
  let queue = await db.getPlaylistFromDB();
  if (queue === null) {
    return null;
  }
  // add currentAudio to end of queue
  const currentAudio = queue.shift(); // remove from list
  queue.push(currentAudio); // add currnetAudio to end of queue
  await webhooks.updatePlaylist(queue); // update list
  return currentAudio;
};

const playAudioToBroadcast = audio => {
  const stream = ytdl(audio, { filter: "audioonly" });
  broadcastState.broadcast.playStream(stream);
};

const messageHasDM = (message, options) => {
  options.embed.description = constants.HELPER_TEXT;
  return message.channel.send(options);
};

const messageHasMention = (message, options) => {
  options.embed.description = constants.HELPER_TEXT;
  return message.channel.send(options);
};

const messageHasPrefix = async (message, options) => {
  const prefix = constants.GET_DISCORD_PREFIX(message.content);
  const prefixIndex = message.content.indexOf(prefix);
  const msg = message.content.slice(prefixIndex + prefix.length); // slice of the prefix on the message
  let args = msg.split(" "); // break the message into part by spaces
  const cmd = args[0].toLowerCase(); // set the first word as the command in lowercase just in case
  args.shift(); // delete the first word from the args
  const translation = await naverAPI.getTranslation(msg); // try to lookup in dictionary'
  await db.sendTermToDB(msg);
  io.emit("newTerm");
  if (message.channel.type === "dm") {
    // Direct Message
    if (cmd === "who" || cmd === "whoami" || msg === "whoru") {
      // Talk about yourself maybe
      return;
    }
  }

  // Make sure this command always checks for you. YOU NEVER WANT ANYONE ELSE TO USE THIS COMMAND
  if (
    cmd === "eval" &&
    message.author.id === process.env.KOREAN_DICT_BOT_DISCORD_OWNER
  ) {
    // < checks the message author's id to owners
    const code = args.join(" ");
    return evalCmd(message, code);
  } else if (translation) {
    const url = constants.DICTIONARY_LINK + encodeURIComponent(msg);
    const formatedItems = translation.map(format.formatDictionaryItem);
    const formatedString = formatedItems.join("\n");
    options.embed.fields = constants.NAVER_FIELDS(url);
    options.embed.description = `${formatedString}`;
    options.embed.title = format.NAVER_TITLE(translation, msg);
    return message.channel.send(options);
  } else {
    // if the command doesn't match anything
    options.embed.description = constants.CONFUSED_COMAND;
    message.channel.send(options);
    return;
  }
};

function evalCmd(message, code) {
  if (message.author.id !== process.env.KOREAN_DICT_BOT_DISCORD_OWNER) return;
  try {
    let evaled = eval(code);
    if (typeof evaled !== "string") evaled = util.inspect(evaled);
    message.channel.send(clean(evaled), { code: "xl" });
  } catch (err) {
    message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
  }
}

function clean(text) {
  if (typeof text !== "string") {
    text = util.inspect(text, { depth: 0 });
  }
  text = text
    .replace(/`/g, "`" + String.fromCharCode(8203))
    .replace(/@/g, "@" + String.fromCharCode(8203))
    .replace(
      process.env.KOREAN_DICT_BOT_DISCORD_TOKEN,
      "mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0"
    ); //Don't let it post your token
  return text;
}

bot.on("ready", ready);
bot.on("message", message);
bot.on("error", e => console.log("botOnError", e));
bot.on("disconnect", e => console.log("botOnDisconnect", e));
bot.on("resume", e => console.log("botOnResume", e));
bot.on("warn", e => console.log("botOnWarn", e));
