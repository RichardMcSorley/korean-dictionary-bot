const handle = async ({ message }) => {
  console.log("botOnError");
  process.exit(1)
};

module.exports = {
  handle,
  name: "error"
};
