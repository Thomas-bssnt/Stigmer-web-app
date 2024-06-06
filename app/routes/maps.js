let express = require("express");
let router = express.Router();
let auth = require("../middleware/auth");
let maps = require("../controllers/maps");

/* GET maps page. */
router.get("/", auth.isAuthorized, maps.getMaps);

/* POST maps page. */
router.post("/", auth.isAuthorized, maps.postMaps);

//XHR refresh the values of fields in maps
router.post("/mapValue", auth.isAuthorized, maps.mapValue);

module.exports = router;
