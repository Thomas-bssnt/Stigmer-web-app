const sanitize = require("mongo-sanitize");
const totalscoresessionversus = require("../models/totalscoresessionversus");
const { getDay } = require("../tools/convertDateMillis");

module.exports.getLocal = function (req, res) {
  let env = req.app.get("env");
  res.render("local", {
    title: "Stigmer Game",
    env: env,
  });
};

module.exports.versusGameScore = function (req, res) {
  let date = sanitize(req.body.date);
  date = getDay(date);
  let session = parseInt(sanitize(req.body.session));
  totalscoresessionversus.distinct("group", { date: date, session: session }).then((doc) => {
    res.json({ scores: doc });
  });
};
