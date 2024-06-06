let express = require("express");
let router = express.Router();
let auth = require("../middleware/auth");
let replay = require("../controllers/replay");

/* GET replay page. */
router.get("/", auth.isAuthorized, replay.getReplay);
/* POST replay page. */
//get data in DB
router.post("/games", auth.isAuthorized, replay.postReplay);
//remove data in DB
router.post("/removeGame", auth.isAuthorized, replay.removeGame);

module.exports = router;
