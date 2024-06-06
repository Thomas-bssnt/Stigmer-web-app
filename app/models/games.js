const db = require("./db");
const games = db.get("gamescollection");

games.createIndex(
  {
    gameName: 1,
  },
  {
    unique: true,
  }
);

module.exports = games;
