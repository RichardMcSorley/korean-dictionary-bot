const { io } = require("../../next-server");
const { db } = require("../../firebase");
const livechatDBResource =
  process.env.NODE_ENV === "development" ? `livechat` : "livechat";

const handle = ({ message }) => {
  const msg = message.val();
  if (msg.author !== "Nightbot" && msg.author !== "Korean Dictionary *") {
    io.emit("NEW_YOUTUBE_LIVE_MESSAGE", msg);
  }
};

module.exports = {
  ref: db
    .ref(livechatDBResource)
    .orderByKey()
    .limitToLast(1),
  name: "child_added",
  handle: handle
};
