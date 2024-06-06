let express = require("express");
let router = express.Router();
let auth = require("../middleware/auth");
let rules = require("../controllers/rules");

/* GET connection page. */
router.get("/", auth.isAuthorized, rules.getRules);
/* POST connection page. */
router.post("/", auth.isAuthorized, rules.postRules);
//XHR refresh the values of fields in rules
router.post("/ruleValue", auth.isAuthorized, rules.ruleValue);

module.exports = router;
