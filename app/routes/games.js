let express = require("express");
let router = express.Router();
let auth = require("../middleware/auth");
let games = require("../controllers/games");

/* GET games page. */
router.get("/", auth.isAuthorized, games.getGames);

/* POST games page. */
router.post("/", auth.isAuthorized, games.postGames);

//XHR refresh the values of fields in games
router.post("/gameValue", auth.isAuthorized, games.gameValue);

module.exports = router;
