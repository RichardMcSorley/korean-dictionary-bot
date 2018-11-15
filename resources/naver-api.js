const constants = require('../utils/constants');
const fetch = require('node-fetch');

module.exports.getTranslation = async (text) => {
    try {
        const url = constants.DICTIONARY_API_URL + encodeURIComponent(text);
        //console.log(url)
        const response = await fetch(url);
        const json = await response.json();
        if (json.items && json.items[0] && json.items[0].length > 0) {
            let items = json.items[0]; 
            return items;
        } else {
            return null
        }
    } catch (error) {
        return console.log('error', error);
    }
};