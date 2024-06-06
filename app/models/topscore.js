const db = require("./db");
const topScore = db.get("topscore");

topScore.createIndex(
  {
    rule: 1,
  },
  {
    unique: true,
  }
);
topScore.createIndex({
  scoreArray: 1,
});

module.exports = topScore;
