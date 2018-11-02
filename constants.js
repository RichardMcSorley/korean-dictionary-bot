const moment = require('moment');
const format = require('./format-text');
module.exports.HELPER_TEXT = `Use !define or !정의 followed by a word to get a definition.`;
module.exports.CONFUSED_COMAND = `Sorry I'm a little confused, please try again...`;
module.exports.DICTIONARY_API_URL = "https://ac.dict.naver.com/koendict/ac?q_enc=utf-8&st=1000&r_format=json&r_enc=utf-8&r_lt=1000&r_unicode=0&r_escape=1&q=";
module.exports.DICTIONARY_LINK = "https://endic.naver.com/search.nhn?sLn=kr&searchOption=all&query=";
module.exports.isMention = (message, bot) => message.content.indexOf("<@" + bot.user.id) === 0 || message.content.indexOf("<@!" + bot.user.id) === 0;
module.exports.isDM = (message) => message.channel.type === 'dm';
module.exports.NAVER_VIDEO_LINK = `[Click here to learn how to use Naver Dictionary](https://www.youtube.com/watch?v=KcPPllmx-Rc) By TTMIK`;
module.exports.NAVER_FIELDS = (url) => [
    {
        name: "More",
        value: format.NAVER_MORE_URL(url)
    },
    {
        name: "How to",
        value: module.exports.NAVER_VIDEO_LINK
    }
];
module.exports.APP_AVATAR = `https://scontent-dfw5-1.cdninstagram.com/vp/e28d4f5b552fda7f57318cd2fa74243d/5C88F357/t51.2885-19/s320x320/44491467_439599376445310_8268611806365220864_n.jpg`;
module.exports.APP_COPYRIGHT = `Copyright ⓒ ${moment().format('YYYY')} "한국언니 Korean Unnie" All Rights Reserved.`;
module.exports.GET_DEFAULT_MESSAGE_OPTIONS = () => ({
    embed: {
        color: 3447003,
        timestamp: moment().format(),
        footer: {
            icon_url: module.exports.APP_AVATAR,
            text: module.exports.APP_COPYRIGHT
        }
    }
});
module.exports.GET_DISCORD_PREFIX = (text) => {
    if (text.indexOf(`!define `) === 0) {
        return `!define `;
    } else if (text.indexOf(`!정의 `) === 0) {
        return `!정의 `;
    } else {
        return null;
    }
};