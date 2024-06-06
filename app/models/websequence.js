const db = require("./db");
const webSequence = db.get("websequence");

webSequence.createIndex({
  session: 1,
});
webSequence.createIndex({
  randomGame: 1,
});

module.exports = webSequence;
