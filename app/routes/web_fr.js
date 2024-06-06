let express = require("express");
let router = express.Router();
let web = require("../controllers/web_fr");

/* GET web page. */
router.get("/", web.getWeb_fr);

module.exports = router;
