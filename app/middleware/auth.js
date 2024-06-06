//check auth
//only admin
module.exports.isAuthorized = function (req, res, next) {
  const regex = /^[J][0-9]+$/g;
  let sess = req.session;

  if (sess.user === "" || sess.user === undefined || sess.user.id.match(regex)) {
    res.redirect(req.pageContext + "/connection");
  } else return next();
};

//admin or local player
module.exports.isPlayerAuthorized = function (req, res, next) {
  let sess = req.session;

  if (sess.user == "" || sess.user == undefined) {
    res.redirect(req.pageContext + "/connection");
  } else return next();
};
