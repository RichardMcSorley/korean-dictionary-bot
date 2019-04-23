const request = require("request");
const getYouTubeID = require('get-youtube-id');
const yt_api_key = process.env.YOUTUBE_API_KEY;

module.exports = {
    search_video: function (query, cb, err) {
        request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(query) + "&key=" + yt_api_key, function(error, response, body) {
            try{var json = JSON.parse(body);}catch(error){err(error)}
            if(json.items && json.items.length > 0 && json.items[0].id.videoId){
                cb(json.items[0].id.videoId);
            }else{
                err('Seems there are no videos...');
            }    
        });
    },
    isYoutube: function (str) {
        return str.toLowerCase().indexOf("youtube.com") > -1;
    },

    getID: function (str, cb) {
        if (this.isYoutube(str)) {
            cb(getYouTubeID(str));
        } else {
            this.search_video(str, function(id) {
                cb(id);
            });
        }
    }
};