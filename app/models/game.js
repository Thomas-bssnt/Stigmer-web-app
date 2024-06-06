const db = require("./db");
const game = db.get("gamecollection");

game.createIndex({
  _id: 1,
});
game.createIndex({
  data: 1,
});
game.createIndex({
  players: 1,
});
module.exports = game;
