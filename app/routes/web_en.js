let express = require("express");
let router = express.Router();
let web = require("../controllers/web_en");

/* GET web page. */
router.get("/", web.getWeb_en);

module.exports = router;
