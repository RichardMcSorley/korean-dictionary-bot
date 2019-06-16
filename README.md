# Korean Dictionary Discord Bot [![CircleCI](https://circleci.com/gh/RichardMcSorley/korean-dictionary-bot.svg?style=svg)](https://circleci.com/gh/RichardMcSorley/korean-dictionary-bot)

Created for use in KoreanUnnie's discord [Youtube Channel Link](https://www.youtube.com/koreanunnie)

Looks up words using Naver API. Dashboard to manage some pieces of functionality. Listens for updates on firebase resources and sends messages to proper discord channels, Youtube Video uploads and when KoreanUnnie live streams. Can automatically connect to YoutubeChannel while live and listen for livechat messages. Runs a Korean Listening Practice voice channel and automatically pauses when no one is listening, to save bandwidth.

### Technologies used:

- discord.js
- firebase
- nodejs
- react
- nextjs
- echarts
- socket.io
- ffmpeg
- ziet now

Dependant on [youtube-cron-job](https://github.com/RichardMcSorley/youtube-cron-job)
and [youtube-puppeteer](https://github.com/RichardMcSorley/youtube-puppeteer) for youtube live streaming functionality
