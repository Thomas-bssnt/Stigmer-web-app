let express = require("express");
let router = express.Router();
let auth = require("../middleware/auth");
let newgame = require("../controllers/newgame");

/* GET admin page. */
router.get("/", auth.isAuthorized, newgame.getNewGame);

//create or refresh a game sequence
router.post("/addWebGameList", auth.isAuthorized, newgame.addWebGameList);

//XHR : add a new game in local
router.post("/addGame", auth.isAuthorized, newgame.addGame);

module.exports = router;
