let express = require("express");
let router = express.Router();
let auth = require("../middleware/auth");
let bots = require("../controllers/bots");

/* GET bots page. */
router.get("/", auth.isAuthorized, bots.getBots);

/* POST bots page. */
router.post("/", auth.isAuthorized, bots.postBots);

//XHR refresh the values of fields in bots
router.post("/botValue", auth.isAuthorized, bots.botValue);

module.exports = router;
