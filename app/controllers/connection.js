const adminPass = require("../passwords/admin");
const playerPass = require("../passwords/player");

/* GET connection page. */
module.exports.getconnection = function (req, res, next) {
  res.render("connection", {
    title: "Stigmer",
  });
};

//login
module.exports.login = function (req, res, next) {
  const regex = /^[J][0-9]+$/g;
  let user = {};
  let sess = req.session;
  if (req.body.userId == "admin" && req.body.password == adminPass) {
    //Store admin in session
    user.id = req.body.userId;
    sess.user = user;
    res.redirect(req.pageContext + "/newgame");
  } else if (req.body.userId.match(regex) && req.body.password == playerPass) {
    //Store user in session
    user.id = req.body.userId;
    user.gender = req.body.playerGenderLocal;
    user.age = req.body.playerAgeLocal;
    sess.user = user;
    res.redirect(req.pageContext + "/local");
  } else {
    res.redirect(req.pageContext + "/connection");
  }
};
