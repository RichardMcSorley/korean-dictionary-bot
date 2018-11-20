const { io } = require("../../next-server");
const { db } = require("../../firebase");
const moment = require("moment");
const { sendMessage } = require("../../resources/puppet-api");
const connectedMessage = "🤖 SUCCESSFULLY CONNECTED 📚";
const youtubeSubscriptionDBResource =
  process.env.NODE_ENV === "development"
    ? `TestKoreanUnnieVideos`
    : "KoreanUnnieVideos";

const handle = ({ message }) => {
  const video = message.val();
  if (
    moment(video.publishedAt, "YYYY-MM-DDThh:mm:ss.sZ").isBetween(
      moment().subtract(30, "minutes"),
      moment()
    )
  ) {
    if (video.liveBroadcastContent === "live") {
      console.log("attempting to connect to live stream ");
      connectToStream(video.videoId);
    }
    io.emit("NEW_VIDEO", video);
  }
};

const connectToStream = async videoId => {
  try {
    const json = await sendMessage({ videoId, message: connectedMessage });
    if (json.message === connectedMessage) {
      console.log(
        "Bot is connected to live stream, https://youtube.com/watch?v=" +
          videoId
      );
    }
  } catch (error) {
    console.log("Could not connect to live server", error);
  }
};

module.exports = {
  ref: db.ref(youtubeSubscriptionDBResource + "/videos"),
  name: "child_added",
  handle: handle
};
