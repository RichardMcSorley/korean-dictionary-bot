const { db, getProcessedVideos } = require("../../firebase");
let videoCache = {};
const videoDBRes = "videos";
const discordChannel = process.env.YOUTUBE_DISCORD_CHANNEL;
const mqlight = require('mqlight');
const topic = 'ready_youtube_video';
const _ = require('lodash');
const moment = require('moment');

const handle = async ({ bot }) => {
  try {
    videoCache = await getProcessedVideos();
    console.log(videoCache);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
  const rc = mqlight.createClient({ service: `amqp://${process.env.MQLIGHT_SERVICE_HOST}:${process.env.MQLIGHT_SERVICE_PORT_AMQP}` });
  rc.on('started', () => {
    rc.subscribe(topic);
    rc.on('message', function (video) {
      console.log('Recieved Video:', video.videoId);
      runVideoLogic(video);
    });
    rc.on("error", (err) => {
      console.log(err);
      process.exit(1);
    });
  });

  const runVideoLogic = async (video) => {
    if(!video.videoId in videoCache){
      videoCache[video.videoId] = 1; // add to cache
      let verb = "uploaded";
      if (video.liveBroadcastContent === "live") {
        verb = "is live";
      }
      if (video.liveBroadcastContent === "upcoming") {
        verb = "is about to go live";
      }
      const channel = await bot.channels.get(discordChannel);
      console.log(`about to send ${video.videoId} to channel`);
      await channel.send(
        `**@everyone ${video.channelTitle}** ${verb} **${_.unescape(video.title)}** at ${
        video.videoUrl
        }`
      );
      db.ref(videoDBRes + "/processed/" + video.videoId).set(moment().toString());
    }
  }
}

module.exports = {
  needsBot: true,
  handle
  //  queue
};
