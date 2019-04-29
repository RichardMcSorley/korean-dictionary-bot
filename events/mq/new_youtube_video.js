const { findKoreanUnnie } = require("../../utils/search");
const { db, getChannelInfoFromDB, getProcessedVideos } = require("../../firebase");
const moment = require("moment");
let videoCache = {};
const videoDBRes = "videos";
const discordChannel = process.env.YOUTUBE_DISCORD_CHANNEL;
const constants = require("../../utils/constants");
const numeral = require("numeral");
const mqlight = require('mqlight');
const topic = 'new_youtube_video';

const handle = async ({ bot }) => {
    try {
      videoCache = await getProcessedVideos();
      console.log(videoCache);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
    const rc = mqlight.createClient({service: `amqp://${process.env.MQLIGHT_SERVICE_HOST}:${process.env.MQLIGHT_SERVICE_PORT_AMQP}`});
    rc.on('started', ()=> {
        rc.subscribe(topic);
        rc.on('message', function(video) {
            console.log('Recieved Video:', video.videoId);
            runVideoLogic(video);
        });
        rc.on("error", (err)=>{
          console.log(err);
          process.exit(1);
        });
    });
    
    const runVideoLogic = async (video)=>{
        if (
            !isVideoInCache(video, videoCache) &&
            isKoreanUnnie(video)
          ) {
            videoCache[video.videoId] = 1; // add to cache
            const channelInfo = await getChannelInfoFromDB(video.channelId);
            let verb = "uploaded";
            if (video.liveBroadcastContent === "live") {
              verb = "is live";
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
              `**${announcement} ${video.channelTitle}** ${verb} **${video.title}** ${at} ${
                video.videoUrl
              }`
            );
            await channel.send(options);
          }
          db.ref(videoDBRes + "/processed/" + video.videoId).set(1);
    }
  const isVideoInCache = (video, videoCache) => {
    const check = video.videoId in videoCache;
    if(check){
      console.log(`Video ${video.videoId} is in Cache`);
    }else{
      console.log(`Video ${video.videoId} is not in Cache`);
    }
    return check;
  }
     
  const isVideoYoung = video => {
    const check = 
      moment(video.publishedAt, "YYYY-MM-DDThh:mm:ss.sZ")
        .isBetween( moment().subtract(1, "hour"), moment());
    if(check){
      console.log(`Video ${video.videoId} is young.`);
    }else{
      console.log(`Video ${video.videoId} is not young.`);
    }
    return check;
    
  };
  const isKoreanUnnie = video => {
    const check = findKoreanUnnie(
      `${video.channelTitle} ${video.description} ${video.title} ${
        video.channelTitle
      }`
    );
    if(check){
      console.log(`Video ${video.videoId} has Korean Unnnie.`);
    }else{
      console.log(`Video ${video.videoId} does not have Korean Unnnie.`);
    }
    return check;
  };
};

module.exports = {
  needsBot: true,
  handle
  //  queue
};
