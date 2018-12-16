const { findKoreanUnnie } = require("../../utils/search");
const { db, getChannelInfoFromDB } = require("../../firebase");
const Queue = require("firebase-queue");
const moment = require("moment");
let videoCache = {};
const videoDBRes = "videos";
const discordChannel = process.env.YOUTUBE_DISCORD_CHANNEL;
const constants = require("../../utils/constants");
var numeral = require("numeral");
const handle = async ({ bot }) => {
  const queue = new Queue(
    db.ref(videoDBRes + 2),
    { sanitize: false, suppressStack: true },
    async (video, progress, resolve, reject) => {
      if (
        isVideoYoung(video) &&
        !(video.videoId in videoCache) &&
        isKoreanUnnie(video)
      ) {
        videoCache[video.videoId] = 1; // add to cache
        const channelInfo = await getChannelInfoFromDB(video.channelId);
        let verb = "uploaded";
        if (video.liveBroadcastContent === "live") {
          verb = "is live";
          const ko = {
            announcement: `여러분! 안녕하세요. 한국언니 방송 시작핬습니다!`,
            lang: "ko"
          };
          const en = {
            announcement: `Korean Unnie is live, go check it out!`,
            lang: "en-us"
          };
          bot.cachedQueue.splice(0, 0, en); //add announcement to queue
          bot.cachedQueue.splice(0, 0, ko); //add announcement to queue
          bot.broadcastState.broadcast.end(); // stop current audio
        }
        if (video.liveBroadcastContent === "upcoming") {
          verb = "is about to go live";
        }
        const channel = await bot.channels.get(discordChannel);
        let options = constants.GET_DEFAULT_MESSAGE_OPTIONS();
        options.setAuthor(
          `${channelInfo.title} is now at ${numeral(
            channelInfo.subscriberCount
          ).format("0a")} subscribers and ${numeral(
            channelInfo.viewCount
          ).format("0a")} total views.`,
          channelInfo.smallImage,
          channelInfo.url
        );
        options.setURL(video.videoUrl);
        console.log("about to send to channel");
        await channel.send(
          `**@everyone ${video.channelTitle}** ${verb} **${video.title}** at ${
            video.videoUrl
          }`
        );
        await channel.send(options);
      }
      db.ref(videoDBRes + "/processed/" + video.videoId).set(1);
      return db
        .ref(videoDBRes + 2)
        .child(video._id)
        .remove()
        .then(resolve)
        .catch(reject);
    }
  );
  const isVideoYoung = video => {
    return moment(video.publishedAt, "YYYY-MM-DDThh:mm:ss.sZ").isBetween(
      moment().subtract(1, "hour"),
      moment()
    );
  };
  const isKoreanUnnie = video => {
    return findKoreanUnnie(
      `${video.channelTitle} ${video.description} ${video.title} ${
        video.channelTitle
      }`
    );
  };
};

module.exports = {
  needsBot: true,
  handle
  //  queue
};
