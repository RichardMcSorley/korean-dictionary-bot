const { io } = require("../../next-server");
const { db } = require("../../firebase");
const Queue = require("firebase-queue");
const youtubeSubscriptionDBResource =
  process.env.NODE_ENV === "development"
    ? `TEST/KoreanUnnieVideos`
    : "KoreanUnnieVideos";
const moment = require("moment");
const { sendMessage } = require("../../resources/puppet-api");
const connectedMessage = "🤖 SUCCESSFULLY CONNECTED 📚";
const queue = new Queue(
  db.ref(youtubeSubscriptionDBResource),
  { sanitize: false, suppressStack: true },
  (video, progress, resolve, reject) => {
    console.log(video);
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
    return db
      .ref(youtubeSubscriptionDBResource)
      .child(video._id)
      .remove()
      .then(resolve)
      .catch(reject);
  }
);

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
  queue
};
