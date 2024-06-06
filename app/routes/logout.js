let express = require("express");
let router = express.Router();

//logout
router.get("/", function (req, res, next) {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect(req.pageContext + "/connection");
  });
});
module.exports = router;
