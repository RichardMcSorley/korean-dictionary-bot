const Discord = require('discord.js');
const naverAPI = require('./naver-api');
const io = require('./next-server').io;
const db = require('./firebase/index');
const bot = new Discord.Client({
    disableEveryone: true,
    disabledEvents: ['TYPING_START']
});

// Catch Errors before they crash the app.
process.on('uncaughtException', (err) => {
    const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
    console.error('Uncaught Exception: ', errorMsg);
    // process.exit(1); //Eh, should be fine, but maybe handle this?
});

process.on('unhandledRejection', err => {
    console.error('Uncaught Promise Error: ', err);
    // process.exit(1); //Eh, should be fine, but maybe handle this?
});

bot.login(process.env.KOREAN_DICT_BOT_DISCORD_TOKEN);

const util = require('util');
const constants = require('./constants.js');
const format = require('./format-text');

const message = async message => { // on message event
    let options = constants.GET_DEFAULT_MESSAGE_OPTIONS();
    const prefix = constants.GET_DISCORD_PREFIX(message.content);
    if (message.author.bot || message.system) { // Ignore bots
        return
    }
    if (prefix) { // Message includes your prefix, not DM
        return messageHasPrefix(message, options);
    } else if (constants.isDM(message, bot)) { // Catch DM
        return messageHasDM(message, options);
    } else if (constants.isMention(message, bot)) { // Catch @Mentions
        return messageHasMention(message, options);
    }
    return;
};

const ready = () => {
    bot.user.setActivity('Looking up words!'); //you can set a default game
    console.log(`Bot is online!\n${bot.users.size} users, in ${bot.guilds.size} servers connected.`);
}
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
    await db.sendTermToDB(msg)
    io.emit("newTerm")
    if (message.channel.type === 'dm') { // Direct Message
        if(cmd === 'who' || cmd === 'whoami' || msg === 'whoru' ){ // Talk about yourself maybe
            return; 
        }
    }

    // Make sure this command always checks for you. YOU NEVER WANT ANYONE ELSE TO USE THIS COMMAND
    if (cmd === "eval" && message.author.id === process.env.KOREAN_DICT_BOT_DISCORD_OWNER) { // < checks the message author's id to owners
        const code = args.join(" ");
        return evalCmd(message, code);
    }
    else if (translation) {
        const url = constants.DICTIONARY_LINK + encodeURIComponent(msg);
        const formatedItems = translation.map(format.formatDictionaryItem);
        const formatedString = formatedItems.join("\n");
        options.embed.fields = constants.NAVER_FIELDS(url);
        options.embed.description = `${formatedString}`;
        options.embed.title = format.NAVER_TITLE(translation, msg);
        return message.channel.send(options);
    }

    else { // if the command doesn't match anything
        options.embed.description = constants.CONFUSED_COMAND;
        message.channel.send(options);
        return;
    }

};

function evalCmd(message, code) {
    if (message.author.id !== process.env.KOREAN_DICT_BOT_DISCORD_OWNER) return;
    try {
        let evaled = eval(code);
        if (typeof evaled !== "string")
            evaled = util.inspect(evaled);
        message.channel.send(clean(evaled), { code: "xl" });
    } catch (err) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
}

function clean(text) {
    if (typeof (text) !== 'string') {
        text = util.inspect(text, { depth: 0 });
    }
    text = text
        .replace(/`/g, '`' + String.fromCharCode(8203))
        .replace(/@/g, '@' + String.fromCharCode(8203))
        .replace(process.env.KOREAN_DICT_BOT_DISCORD_TOKEN, 'mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0') //Don't let it post your token
    return text;
}

bot.on("ready", ready);
bot.on("message", message);
bot.on("error", console.log);
bot.on("disconnect", console.log);
bot.on("resume", console.log);
bot.on("warn", console.log);