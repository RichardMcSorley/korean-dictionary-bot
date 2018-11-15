const firebase = require("./firebase");
const fetch = require("node-fetch");
const db = firebase.database;

const DBResource =
  process.env.NODE_ENV === "development"
    ? `TestKoreanDictionaryTerms`
    : "KoreanDictionaryTerms";
const videoInfoDBResource =
  process.env.NODE_ENV === "development"
    ? `TestKoreanListeningPracticePlaylistInfo`
    : "KoreanListeningPracticePlaylistInfo";
const videoPlaylistDBResource =
  process.env.NODE_ENV === "development"
    ? `TestKoreanListeningPracticePlaylist`
    : "KoreanListeningPracticePlaylist";
const youtubeSubscriptionDBResource =
  process.env.NODE_ENV === "development"
    ? `TestKoreanUnnieVideos`
    : "KoreanUnnieVideos";

const livechatDBResource =
  process.env.NODE_ENV === "development" ? `livechat` : "livechat";
const moment = require("moment");

db.ref(livechatDBResource)
  .endAt()
  .limitToLast(1)
  .on("child_added", childSnapshot => {
    const msg = childSnapshot.val();
    if (msg.author !== "Nightbot" && msg.author !== "Korean Dictionary *") {
      const io = require("../next-server").io;
      io.emit("NEW_YOUTUBE_LIVE_MESSAGE", msg);
    }
  });
db.ref(youtubeSubscriptionDBResource + "/videos")
  .endAt()
  .limitToLast(1)
  .on("child_added", childSnapshot => {
    const video = childSnapshot.val();
    if (
      video.publishedAt &&
      moment(video.publishedAt, "YYYY-MM-DDThh:mm:ss.sZ").isBetween(
        moment().subtract(1, "hour"),
        moment()
      )
    ) {
      if (video.liveBroadcastContent === "live") {
        console.log("attempting to connect to live ");
        connectToStream(video.videoId);
      }
      const io = require("../next-server").io;
      io.emit("NEW_VIDEO", video);
    }
  });
const connectToStream = videoId => {
  fetch(process.env.LIVE_STREAM_SERVER + "/live/" + videoId, { method: "POST" })
    .then(res => res.json())
    .then(json => {
      console.log("response from connection", json);
      if (json.isLoggedIn) {
        fetch(process.env.LIVE_STREAM_SERVER + "/live/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "🤖 SUCCESSFULLY CONNECTED 📚" })
        })
          .then(res => res.json())
          .then(json => {
            console.log("response from send message", json);
            if (json.message === "🤖 SUCCESSFULLY CONNECTED 📚") {
              console.log(
                "Bot should be connected to live stream, https://youtube.com/watch?v=" +
                  videoId
              );
            }
          });
      }
    });
};
module.exports.sendTermToDB = async term => {
  const dbRef = await db.ref(`${DBResource}`);
  return await dbRef.once("value", async function(snapshot) {
    if (await snapshot.hasChild(term)) {
      //already exists, add
      const oldValue = await snapshot.child(term).val().count;
      return await dbRef.child(term).update({ count: oldValue + 1 });
    } else {
      return await dbRef.child(term).set({ count: 1 });
    }
  });
};
module.exports.getTermsFromDB = async () => {
  const eventref = db.ref(DBResource);
  const snapshot = await eventref.once("value");
  const value = snapshot.val();
  return value;
};

module.exports.getChannelInfoFromDB = async () => {
  const eventref = db.ref(youtubeSubscriptionDBResource + "/channel");
  const snapshot = await eventref.once("value");
  const value = snapshot.val();
  return value;
};

module.exports.resetTermsOnDB = async () => {
  const dbRef = db.ref(`${DBResource}`);
  dbRef.set({});
};

module.exports.sendVideoInfoToDB = async videoInfo => {
  const dbRef = await db.ref(`${videoInfoDBResource}`);
  return await dbRef.once("value", async function(snapshot) {
    return await dbRef.child(videoInfo.videoId).set(videoInfo);
  });
};

module.exports.updateVideoPlaylist = async playlist => {
  const dbRef = await db.ref(`${videoPlaylistDBResource}`);
  return await dbRef.once("value", async function(snapshot) {
    return await dbRef.set(playlist);
  });
};

module.exports.getVideoInfoFromDB = async videoInfo => {
  const dbRef = await db.ref(`${videoInfoDBResource}`);
  return await dbRef.once("value", async function(snapshot) {
    return await dbRef.child(videoInfo.videoId).set(videoInfo);
  });
};

module.exports.getPlaylistFromDB = async () => {
  const dbRef = await db.ref(`${videoPlaylistDBResource}`);
  const snapshot = await dbRef.once("value");
  const value = snapshot.val();
  return value;
};

module.exports.getPlaylistInfoFromDB = async () => {
  const dbRef = await db.ref(`${videoInfoDBResource}`);
  const snapshot = await dbRef.once("value");
  const value = snapshot.val();
  return value;
};
