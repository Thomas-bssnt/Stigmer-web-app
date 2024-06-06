let express = require("express");
let router = express.Router();
let auth = require("../middleware/auth");
let local = require("../controllers/local");

/* GET local page. */
router.get("/", auth.isPlayerAuthorized, local.getLocal);

router.post("/scores", auth.isPlayerAuthorized, local.versusGameScore);

module.exports = router;
