const handle = async ({ message }) => {
  console.log("botOnDisconnect");
  process.exit(1)
};

module.exports = {
  handle,
  name: "disconnect"
};
