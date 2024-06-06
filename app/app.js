const session = require("express-session");
const express = require("express"),
  slashes = require("connect-slashes");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const helmet = require("helmet");
const redis = require("redis");
const redisStore = require("connect-redis")(session);
const client = redis.createClient();
const connection = require("./routes/connection");
const index = require("./routes/index");
const local = require("./routes/local");
const replay = require("./routes/replay");
const newgame = require("./routes/newgame");
const web = require("./routes/web");
const web_en = require("./routes/web_en");
const web_fr = require("./routes/web_fr");
const logout = require("./routes/logout");
const games = require("./routes/games");
const maps = require("./routes/maps");
const rules = require("./routes/rules");
const bots = require("./routes/bots");
const topscore = require("./routes/topscore");
const scores = require("./routes/scores");
const manage = require("./routes/manage");
let auth = require("./middleware/auth");
const app = express();

//! ///IMPORTANT!!!\\\ path base name

const stigmerPath = "/Stigmer";
app.use(function (req, res, next) {
  // set stigmer path for production
  req.pageContext = req.app.get("env") === "development" ? "" : stigmerPath;
  next();
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.set("trust proxy", 1); // trust first proxy

//session
app.use(
  session({
    secret: "Y^jif4H9sSH/+%{M",
    // create new redis store.
    store: new redisStore({
      host: "localhost",
      port: 6379,
      client: client,
      ttl: 260,
    }),
    saveUninitialized: false,
    resave: false,
    cookie: {
      secure: false, // if true only transmit cookie over https
      httpOnly: false, // if true prevent client side JS from reading the cookie
      maxAge: 1000 * 60 * 60 * 12, // session max age in miliseconds
    },
  })
);

app.use(logger("dev"));
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  next();
});

app.use(express.json());
app.use(helmet.xssFilter());
app.use(helmet.hidePoweredBy());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/bower_components", express.static(path.join(__dirname, "bower_components/")));
app.use("/node_modules", express.static(path.join(__dirname, "node_modules/")));
app.use(express.static(path.join(__dirname, "public")));
app.use("/archives", auth.isAuthorized, express.static(path.join(__dirname, "archives/")));

app.use(
  slashes(false, {
    base: "/Stigmer",
  })
);

app.use("/", index);
app.use("/topscore", topscore);
app.use("/connection", connection);
app.use("/local", local);
app.use("/replay", replay);
app.use("/newgame", newgame);
app.use("/web", web);
app.use("/web/en", web_en);
app.use("/web/fr", web_fr);
app.use("/logout", logout);
app.use("/games", games);
app.use("/maps", maps);
app.use("/rules", rules);
app.use("/bots", bots);
app.use("/manage", manage);
app.use("/scores", scores);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
