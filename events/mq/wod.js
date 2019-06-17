const discordChannel = process.env.WORD_OF_DAY_CHANNEL;
const mqlight = require('mqlight');
const topic = 'wod';
const {GET_DEFAULT_MESSAGE_OPTIONS} = require('../../utils/constants');
const moment = require('moment');
const { titleCase } = require("../../utils/format-text");

const handle = async ({ bot }) => {
  const rc = mqlight.createClient({ service: `amqp://${process.env.MQLIGHT_SERVICE_HOST}:${process.env.MQLIGHT_SERVICE_PORT_AMQP}` });
  rc.on('started', () => {
    console.log('started mq wod')
    rc.subscribe(topic);
    rc.on('message', function (wod) {
      console.log('Recieved WOD:', wod);
      runLogic(wod)
    });
    rc.on("error", (err) => {
      console.log(err);
      process.exit(1);
    });
  });

  const runLogic = async (wod) => {
      let channel;
      try {
        channel = await bot.channels.get(discordChannel);
      } catch (error) {
        console.log('ERROR',wod, discordChannel, error)
      }
      const options = GET_DEFAULT_MESSAGE_OPTIONS();
      options.setThumbnail(
        "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/155/books_1f4da.png"
      );
      options.setTitle(`Word of the Day - ${moment().format('M월-D일')}`);
      options.addField('Korean', wod.ko, true);
      options.addField('English', titleCase(wod.en), true);
      options.addField('Example', `${wod.phrase.ko}\n${wod.phrase.en}`, false);
      await channel.send(options);
  }
}

module.exports = {
  needsBot: true,
  handle
};



