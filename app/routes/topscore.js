let express = require("express");
let router = express.Router();
let topScore = require("../controllers/topscore");

/* POST refresh the top score */
router.post("/", topScore.refresh);

module.exports = router;
