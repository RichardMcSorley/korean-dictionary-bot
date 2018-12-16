const package = require("../package.json");
const firebase = require("../firebase/index");
const {
  pathWrapper,
  defaultHandlerWrapper,
  nextHandlerWrapper
} = require("./next-wrapper");
const getData = async () => {
  const items = await firebase.getTermsFromDB();
  if (items) {
    const arrayItems = Object.keys(items);
    return arrayItems.map(key => ({ name: key, value: items[key].count }));
  } else {
    return [];
  }
};
module.exports = (server, app) => {
  server.route({
    method: "GET",
    path: "/a",
    handler: pathWrapper(app, "/a")
  });

  server.route({
    method: "GET",
    path: "/b",
    handler: pathWrapper(app, "/b")
  });

  server.route({
    method: "GET",
    path: "/_next/{p*}" /* next specific routes */,
    handler: nextHandlerWrapper(app)
  });

  server.route({
    method: "GET",
    path: "/{p*}" /* catch all route */,
    handler: defaultHandlerWrapper(app)
  });

  server.route({
    method: "GET",
    path: "/static/{p*}" /* catch all route */,
    handler: nextHandlerWrapper(app)
  });

  server.route({
    method: "GET",
    path: "/getAppInfo",
    handler: async function() {
      const { version, name } = package;
      return { version, name };
    }
  });
};

module.exports.getData = getData;
