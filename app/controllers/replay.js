const sanitize = require("mongo-sanitize");
const collection = require("../models/user");

/* GET replay page. */
module.exports.getReplay = function (req, res) {
  let env = req.app.get("env");
  //We don't want to display tests and uncompleted games
  collection
    .aggregate([
      {
        $match: {
          gamecontext: {
            $ne: "test",
          },
        },
      },
      {
        $match: {
          isTheGameComplete: true,
        },
      },
    ])
    .then((games) => {
      res.render("replay", {
        title: "Stigmer Replay",
        games: games,
        env: env,
      });
    })
    .catch((error) => {
      console.log(error.message);
    });
};

//check games data in DB
module.exports.postReplay = function (req, res) {
  let gameid = parseInt(sanitize(req.body.gameid));
  collection
    .findOne({
      gameid: gameid,
    })
    .then((game) => {
      res.send(game);
    })
    .catch((error) => {
      console.log(error.message);
    });
};
//delete data in DB
module.exports.removeGame = function (req, res) {
  let gameid = parseInt(sanitize(req.body.gameid));
  collection
    .findOneAndDelete({
      gameid: gameid,
    })
    .then((result) => {
      result.result.gameid = gameid;
      res.send(result);
    })
    .catch((error) => {
      console.log(error.message);
    });
};
