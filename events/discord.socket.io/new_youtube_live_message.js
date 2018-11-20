const { sendMessage } = require("../../resources/puppet-api");
const handle = ({ message, bot }) => {
  message.channel = {
    send: msg => sendToYoutube(msg, message),
    type: "youtube"
  };
  message.delete = () => {};
  const messageCmd = bot.selfEVENTS.get("message");
  if (messageCmd) {
    messageCmd.handle({ message, bot });
  }
};

const sendToYoutube = async (msg, { videoId, author }) => {
  if (typeof msg === "string") {
    msg = `@${author} ` + msg;
    if (msg.length > 197) {
      msg = msg.substring(0, 197);
      msg = msg + "...";
    }

    // a string we are good to go
    const json = await sendMessage({ videoId, message: msg });
    if (json.message === msg) {
      console.log("message successfuly sent to live chat");
    }
  }
};

module.exports = {
  handle,
  name: "NEW_YOUTUBE_LIVE_MESSAGE"
};
