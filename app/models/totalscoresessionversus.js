const db = require("./db");
const totalscoresessionversus = db.get("totalscoresessionversus");

totalscoresessionversus.createIndex({
  date: 1,
});
totalscoresessionversus.createIndex({
  session: 1,
});
totalscoresessionversus.createIndex({
  group: 1,
});

module.exports = totalscoresessionversus;
