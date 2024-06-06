const db = require("./db");
const totalscoresession = db.get("totalscoresession");

totalscoresession.createIndex({
  date: 1,
});
totalscoresession.createIndex({
  session: 1,
});
totalscoresession.createIndex({
  players: 1,
});

module.exports = totalscoresession;
