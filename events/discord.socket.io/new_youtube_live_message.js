const { sendLiveMessageToDB } = require("../../firebase");
const handle = ({ message, bot }) => {
  message.channel = {
    send: msg => sendToYoutube({ message, payload: msg }),
    type: "youtube"
  };
  message.delete = () => {};
  const messageCmd = bot.selfEVENTS.get("message");
  if (messageCmd) {
    messageCmd.handle({ message, bot });
  }
};

const sendToYoutube = async ({ payload, message }) => {
  const {
    author,
    content,
    timestamp,
    timestampUsec,
    videoId,
    thumbnailUrl
  } = message;
  if (typeof payload === "string") {
    payload = `@${message.author} ` + payload;
    if (payload.length > 197) {
      payload = payload.substring(0, 197);
      payload = payload + "...";
    }
    sendLiveMessageToDB({
      payload,
      author,
      content,
      timestamp,
      timestampUsec,
      videoId,
      thumbnailUrl
    });
  }
};

module.exports = {
  handle,
  name: "NEW_YOUTUBE_LIVE_MESSAGE"
};
