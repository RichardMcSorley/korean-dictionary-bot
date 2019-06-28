const firebase = require("./firebase");
const db = firebase.database;
module.exports.db = db;
const videoInfoDBResource = "playlist/info";
const youtubeSubscriptionDBResource = "videos";
const videoPlaylistDBResource = 'playlist'

module.exports.getChannelInfoFromDB = async channelId => {
  const eventref = db.ref(
    youtubeSubscriptionDBResource + "/channel/" + channelId
  );
  const snapshot = await eventref.once("value");
  const value = snapshot.val();
  return value;
};

module.exports.sendVideoInfoToDB = async videoInfo => {
  const dbRef = await db.ref(`${videoInfoDBResource}`);
  return await dbRef.once("value", async function() {
    return await dbRef.child(videoInfo.videoId).set(videoInfo);
  });
};

module.exports.updateVideoPlaylist = async playlist => {
  const dbRef = await db.ref(`${videoPlaylistDBResource}/list`);
  return await dbRef.once("value", async function(snapshot) {
    return await dbRef.set(playlist);
  });
};

module.exports.getVideoInfoFromDB = async videoInfo => {
  const dbRef = await db.ref(`${videoInfoDBResource}`);
  return await dbRef.once("value", async function() {
    return await dbRef.child(videoInfo.videoId).set(videoInfo);
  });
};

module.exports.getProcessedVideos = async _ => {
  const eventref = db.ref(`videos/processed`);
  const snapshot = await eventref.once("value");
  const value = snapshot.val();
  return value;
};

module.exports.getPlaylistFromDB = async () => {
  const dbRef = await db.ref(`${videoPlaylistDBResource}/list`);
  const snapshot = await dbRef.once("value");
  const value = snapshot.val();
  return value;
};

module.exports.getPlaylistInfoFromDB = async () => {
  const dbRef = await db.ref(`${videoPlaylistDBResource}/info`);
  const snapshot = await dbRef.once("value");
  const value = snapshot.val();
  return value;
};

module.exports.sendTermToDB = async term => {
  const dbRef = await db.ref('dictionary/terms');
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
  const eventref = db.ref('dictionary/terms');
  const snapshot = await eventref.once("value");
  const value = snapshot.val();
  return value;
};