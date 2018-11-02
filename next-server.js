require('dotenv').config();
const package = require('./package.json');
const next = require('next')
const Hapi = require('hapi')
const routes = require('./routes');
const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const firebase = require('./firebase/index');
const server = new Hapi.Server({
  port
})
const io = require('socket.io')(server.listener);
module.exports.io = io;
app
  .prepare()
  .then(async () => {
    routes(server, app);
    server.route({
      method: 'GET',
      path: '/reset/terms', 
      handler: async function () {
        //Reset Terms
        firebase.resetTermsOnDB();
        io.emit("newTerm");
        return 'ok'
      }
    });
    try {
      await server.start();
      console.log(`${package.name} v${package.version}> Ready on port${port}`);
      require('./discord-server');
    } catch (error) {
      console.log('Error starting server');
      console.log(error);
    }
  })