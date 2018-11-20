const { db } = require("../../firebase");
const Queue = require("firebase-queue");
const livechatDBResource =
  process.env.NODE_ENV === "development" ? `TEST/livechat` : "livechat";

const queue = new Queue(
  db.ref(livechatDBResource),
  { sanitize: false, suppressStack: true },
  (msg, progress, resolve, reject) => {
    processChat(msg);
    return db
      .ref(livechatDBResource)
      .child(msg._id)
      .remove()
      .then(resolve)
      .catch(reject);
  }
);

const processChat = msg => {
  if (msg.author !== "Nightbot" && msg.author !== "Korean Dictionary *") {
    const { io } = require("../../next-server");
    io.emit("NEW_YOUTUBE_LIVE_MESSAGE", msg);
  }
};

module.exports = {
  queue
};
