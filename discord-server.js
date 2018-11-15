const Discord = require("discord.js");
const naverAPI = require("./resources/naver-api");
const io = require("./next-server").io;
const db = require("./firebase/index");
const ytdl = require("ytdl-core");
const util = require("util");
const constants = require("./utils/constants");
const format = require("./utils/format-text");
const webhooks = require("./webhooks/index");
var numeral = require("numeral");
const fetch = require("node-fetch");
const myUsername =
  process.env.NODE_ENV === "development"
    ? "Test Korean Dictionary"
    : "Korean Dictionary";
const socketIO = require("socket.io-client")(
  "http://localhost:" + process.env.PORT
); // connect as a client

const bot = new Discord.Client({
  disabledEvents: ["TYPING_START"]
});

bot.lastKLPmessage = null;

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

broadcastState.broadcast.on("error", dispatcher => {
  console.log("Error :(");
});

broadcastState.broadcast.on("end", () => playNextSong());
broadcastState.broadcast.on("error", () => playNextSong());

// use fire for admin purposes, in discord use !define eval fire('restart') to restart the server
const fire = action => {
  const { spawn } = require("child_process");
  switch (action) {
    case "restart":
      const subprocess = spawn(process.argv[0], process.argv.slice(1), {
        // spawn new process
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
      broadcastState.paused = true;
      return "pausing";
    case "resume": // resume broadcast
      broadcastState.broadcast.resume();
      broadcastState.paused = false;
      return "resuming";
    default:
      return "please provide an action";
  }
};

const message = async message => {
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
  const prefix = constants.GET_DISCORD_PREFIX(message.content.toLowerCase());
  if (prefix) {
    // Message includes your prefix, not DM
    return messageHasPrefix(message, options, prefix);
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
  const channel = bot.channels.get(process.env.INITIAL_VOICE_CHANNEL);
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
    .then(connection => {
      connection.playBroadcast(broadcastState.broadcast);
      connection.on("error", err => {
        console.log("error with voice channel");
        connection.disconnect();
        connectToBroadcast(channel);
      });
    })
    .catch(err => console.log("could not join audio channel"));
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
  if (bot.lastKLPmessage) {
    const klp = await buildKLPMessage();
    bot.lastKLPmessage.delete();
    bot.KLPChannel.send(klp);
  }
  return currentAudio;
};

const buildKLPMessage = async () => {
  let options = constants.GET_DEFAULT_MESSAGE_OPTIONS();
  const videoInfo = await db.getPlaylistInfoFromDB();
  const videoList = await db.getPlaylistFromDB();
  const currentVideoId = videoList[videoList.length - 1];
  const currentVideo =
    videoList && videoInfo ? videoInfo[currentVideoId] : null;
  if (currentVideo) {
    // const buffer = await getCurrentKLP();
    // options.attachFile(buffer);
    options.setAuthor("Korean Listening Practice");
    options.setTitle(
      `Currently Playing: ${currentVideo.title} from ${currentVideo.owner}`
    );
    options.setURL(currentVideo.url);
    options.setThumbnail(currentVideo.channelThumbnailUrl);
    return options;
  } else {
    return null;
  }
};

const playAudioToBroadcast = audio => {
  const stream = ytdl(audio, { filter: "audioonly" });
  broadcastState.broadcast.playStream(stream);
};

const messageHasDM = (message, options) => {
  options.setDescription(constants.HELPER_TEXT);
  return message.channel.send(options);
};

const messageHasMention = (message, options) => {
  options.setDescription(constants.HELPER_TEXT);
  return message.channel.send(options);
};

const messageHasPrefix = async (message, options, prefix) => {
  const prefixIndex = message.content.indexOf(prefix.value);
  const msg = message.content.slice(prefixIndex + prefix.value.length); // slice of the prefix on the message
  let args = msg.split(" "); // break the message into part by spaces
  const cmd = args[0].toLowerCase(); // set the first word as the command in lowercase just in case
  args.shift(); // delete the first word from the args

  if (prefix.match === "admin") {
    if (cmd === "words" || cmd === "word") {
      // const buffer = await getWordCloud();
      // options.attachFile(buffer)
      message.channel.send(options);
      return;
    } else if (
      cmd === "eval" &&
      message.author.id === process.env.KOREAN_DICT_BOT_DISCORD_OWNER
    ) {
      // < checks the message author's id to owners
      const code = args.join(" ");
      return evalCmd(message, code);
    }
    return;
  } else if (prefix.match === "ggami") {
    if (message.channel.type === "youtube") {
      return message.channel.send("멍멍! :dog2: :dog:");
    }
    options.setDescription("멍멍! :dog2: :dog:");
    message.channel.send(options);
  } else if (prefix.match === "define") {
    const translation = await naverAPI.getTranslation(msg); // try to lookup in dictionary'
    if (translation) {
      await db.sendTermToDB(msg);
      io.emit("newTerm");

      if (message.channel.type === "youtube") {
        const formatedItems = translation.map(
          format.formatDictionaryItemNoLink
        );
        const formatedString = formatedItems[0];

        return message.channel.send(
          `${formatedString} 📖 Found with Naver Dictionary`
        );
      }
      const url = constants.DICTIONARY_LINK + encodeURIComponent(msg);
      const formatedItems = translation.map(format.formatDictionaryItem);
      const formatedString = formatedItems.join("\n");
      options.setDescription(`${formatedString}`);
      options.setTitle(format.NAVER_TITLE(translation, msg));
      constants.NAVER_FIELDS(url).forEach(field => {
        options.addField(field.name, field.value);
      });
      return message.channel.send(options);
    } else {
      const description = `Sorry no words found for ${msg} :(`;
      if (message.channel.type === "youtube") {
        return message.channel.send(description);
      }
      options.setDescription(description);
      message.channel.send(options);
      return;
    }
  } else if (prefix.match === "help") {
    if (message.channel.type === "youtube") {
      return message.channel.send("Available commands: !define, !help, !ggami");
    }
    options.setTitle("Here are all the my commands:");
    options.setDescription(constants.HELPER_TEXT);
    message.channel.send(options);
  } else if (prefix.match === "KLP") {
    const klp = await buildKLPMessage();
    if (klp) {
      message.channel.send(klp);
      message.delete(1000);
    } else {
      options.setDescription(constants.CONFUSED_COMAND);
      message.channel.send(options);
    }
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

// const getWordCloud = async () => {
//   await page.goto(`http://localhost:${process.env.PORT}/words`);
//   await page.waitFor(1000);
//   const buffer = await page.screenshot({ fullPage: true });
//   // await browser.close();
//   return buffer;
// };

// const getCurrentKLP = async () => {
//   await page.goto(`http://localhost:${process.env.PORT}/KLPcurrent`);
//   await page.waitFor(1000);
//   const buffer = await page.screenshot({ fullPage: true });
//   // await browser.close();
//   return buffer;
// };

bot.on("ready", ready);
bot.on("message", message);
bot.on("error", e => console.log("botOnError", e));
bot.on("disconnect", e => console.log("botOnDisconnect", e));
bot.on("resume", e => console.log("botOnResume", e));
bot.on("warn", e => console.log("botOnWarn", e));
socketIO.on("NEW_VIDEO", async video => {
  const channelInfo = await db.getChannelInfoFromDB();
  let verb = "uploaded";
  if (video.liveBroadcastContent === "live") {
    verb = "is live";
  }
  if (video.liveBroadcastContent === "upcoming") {
    verb = "is about to go live";
  }
  const channel = bot.channels.get(process.env.YOUTUBE_DISCORD_CHANNEL);
  let options = constants.GET_DEFAULT_MESSAGE_OPTIONS();
  options.setAuthor(
    `${channelInfo.title} is now at ${numeral(
      channelInfo.subscriberCount
    ).format("0a")} subscribers and ${numeral(channelInfo.viewCount).format(
      "0a"
    )} total views.`,
    channelInfo.smallImage,
    channelInfo.url
  );
  options.setURL(video.videoUrl);
  await channel.send(
    `**@everyone ${video.channelTitle}** ${verb} **${video.title}** at ${
      video.videoUrl
    }`
  );
  await channel.send(options);
});

socketIO.on("NEW_YOUTUBE_LIVE_MESSAGE", async msg => {
  msg.channel = {
    send: a => sendToYoutube(a, msg),
    type: "youtube"
  };
  msg.delete = () => {};
  message(msg);
});

const sendToYoutube = (obj, msg) => {
  if (typeof obj === "string") {
    // a string we are good to go
    fetch(
      process.env.LIVE_STREAM_SERVER + "/live/" + msg.videoId + "/message",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: obj })
      }
    )
      .then(res => res.json())
      .then(json => {
        if (json.message === obj) {
          console.log("message successfuly sent to live chat");
        }
      });
  }
};

// pause if no one is listening
setInterval(() => {
  pauseBroadcast();
}, 3000);

const pauseBroadcast = () => {
  let total = 0;
  const connections = bot.voiceConnections.array();
  connections.forEach(cn => {
    const channel = cn.channel;
    const members = channel.members ? channel.members.array() : null;
    if (members) {
      total += members.length;
    }
  });
  if (total === 1 && !broadcastState.paused) {
    fire("pause");
    console.log("pause");
  } else if (total > 1 && broadcastState.paused) {
    fire("resume");
    console.log("resume");
  }
};
