const db = require("./db");
const bots = db.get("botscollection");

bots.createIndex(
  {
    botName: 1,
  },
  {
    unique: true,
  }
);

module.exports = bots;
