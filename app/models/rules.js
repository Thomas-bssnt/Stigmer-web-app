const db = require("./db");
const rules = db.get("rulescollection");

rules.createIndex(
  {
    ruleName: 1,
  },
  {
    unique: true,
  }
);

module.exports = rules;
