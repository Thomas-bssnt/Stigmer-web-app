let express = require("express");
let router = express.Router();
let web = require("../controllers/web");

//redirect to web/fr
router.get("/", function (req, res, next) {
  res.redirect(req.pageContext + "/web/fr");
});

//XHR launch a web game
router.post("/playWebGames", web.playWebGames);

//XHR get the contact email
router.post("/contact", web.contact);

module.exports = router;
