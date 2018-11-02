const constants = require('./constants');
module.exports.formatDictionaryItem = (item, index) => `${index + 1}. [${item[0]}](${constants.DICTIONARY_LINK + encodeURIComponent(item[0])}) - ${item[1]}`;
module.exports.NAVER_MORE_URL = (url) => `[Click here for more words and examples.](${url})`
module.exports.NAVER_TITLE = (translation, msg) => `Here are ${translation.length} terms that match ${msg}`