const db = require("./db");
const user = db.get("usercollection");

user.createIndex(
  {
    gameid: 1,
  },
  {
    unique: true,
  }
);
user.createIndex({
  gamename: 1,
});
user.createIndex({
  gamecontext: 1,
});
user.createIndex({
  isTheGameComplete: 1,
});
user.createIndex({
  gamestates: 1,
});

module.exports = user;
