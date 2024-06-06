let express = require("express");
let router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.redirect(req.pageContext + "/web/fr");
});

module.exports = router;
