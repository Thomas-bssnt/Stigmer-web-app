let express = require("express");
let router = express.Router();
let auth = require("../middleware/auth");
let scores = require("../controllers/scores");

/* GET score page. */
router.get("/", auth.isAuthorized, scores.getLocalGames);

//XHR Create the score board
router.post("/getScores", auth.isAuthorized, scores.getScores);

module.exports = router;
