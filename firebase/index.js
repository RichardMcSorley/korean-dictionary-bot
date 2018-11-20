const firebase = require("./firebase");
const fetch = require("node-fetch");

const db = firebase.database;
module.exports.db = db;

const DBResource =
  process.env.NODE_ENV === "development"
    ? `TEST/KoreanDictionaryTerms`
    : "KoreanDictionaryTerms";
const videoInfoDBResource =
  process.env.NODE_ENV === "development"
    ? `TEST/KoreanListeningPracticePlaylistInfo`
    : "KoreanListeningPracticePlaylistInfo";
const videoPlaylistDBResource =
  process.env.NODE_ENV === "development"
    ? `TEST/KoreanListeningPracticePlaylist`
    : "KoreanListeningPracticePlaylist";
const youtubeSubscriptionDBResource =
  process.env.NODE_ENV === "development"
    ? `TEST/KoreanUnnieVideos`
    : "KoreanUnnieVideos";
const puppetDBResource =
  process.env.NODE_ENV === "development"
    ? `TEST/livechat/puppet`
    : "livechat/puppet";

module.exports.sendLiveMessageToDB = async message => {
  const eventref = db.ref(`${puppetDBResource}/tasks`);
  const key = await eventref.push().key;
  eventref.child(key).update(message);
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
