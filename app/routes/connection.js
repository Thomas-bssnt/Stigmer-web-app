let express = require("express");
let router = express.Router();
let connection = require("../controllers/connection");

/* GET connection page. */
router.get("/", connection.getconnection);

//login
router.post("/login", connection.login);

module.exports = router;
