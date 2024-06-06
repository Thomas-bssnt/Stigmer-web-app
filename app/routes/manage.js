let express = require("express");
let router = express.Router();
let auth = require("../middleware/auth");
let manage = require("../controllers/manage");

/* GET manage page. */
router.get("/", auth.isAuthorized, manage.getManage);

//delete DATA
router.post("/deleteData", auth.isAuthorized, manage.deleteData);

//delete DB
router.post("/deleteDB", auth.isAuthorized, manage.deleteDB);

//delete Archive
router.post("/deleteArchive", auth.isAuthorized, manage.deleteArchive);

//create Archive
router.post("/createArchive", auth.isAuthorized, manage.createArchive);

//reset Archive
router.post("/resetTopScore", auth.isAuthorized, manage.resetTopScore);

//All local games
router.post("/allLocalGames", auth.isAuthorized, manage.allLocalGames);
module.exports = router;
