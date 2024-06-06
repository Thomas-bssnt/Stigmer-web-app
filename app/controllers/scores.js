const sanitize = require("mongo-sanitize");
const user = require("../models/user");
const totalscoresession = require("../models/totalscoresession");
const totalscoresessionversus = require("../models/totalscoresessionversus");

/* GET Scores page. */
module.exports.getLocalGames = async function (req, res) {
  //We want to display local and completed games
  try {
    let games = await user.aggregate([
      {
        $match: {
          gamecontext: "local",
        },
      },
      {
        $match: {
          isTheGameComplete: true,
        },
      },
      { $project: { gameid: 1 } },
    ]);

    let session = await totalscoresession.distinct("session");
    let versusSession = await totalscoresessionversus.distinct("session");
    res.render("scores", {
      title: "Scores",
      games: games,
      session: session,
      versusSession: versusSession,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//check games data in the user collection or scores data in the scores collection
module.exports.getScores = function (req, res) {
  let button = req.body.button;
  let scoresHi = sanitize(parseInt(req.body.scoresHi));
  let scoresLo = sanitize(parseInt(req.body.scoresLo));
  let session = sanitize(parseInt(req.body.session));
  let versusSession = sanitize(parseInt(req.body.versusSession));
  //between two games
  if (button === "multiple") {
    user
      .aggregate([
        {
          $match: {
            gameid: { $gte: scoresLo, $lte: scoresHi },
          },
        },
        {
          $project: { "gamestates.pointgain": 1, "gamestates.player": 1 },
        },
      ])
      .then((games) => {
        let dateScoreMap = new Map();
        games.forEach((game) => {
          game.gamestates.forEach((state) => {
            if (!dateScoreMap.has(state.player)) {
              //Only J1,J2,...,J10,Jn
              const regex = /^[J][0-9]+$/g;
              if (state.player.match(regex)) {
                dateScoreMap.set(state.player, state.pointgain);
              }
            } else {
              dateScoreMap.set(state.player, dateScoreMap.get(state.player) + state.pointgain);
            }
          });
        });
        //sort the map
        let mapAsc = new Map([...dateScoreMap.entries()].sort((a, b) => b[1] - a[1]));
        let mapStr = JSON.stringify(mapAsc, replacer);
        res.json({ scores: mapStr });
      })
      .catch((error) => {
        console.log(error.message);
      });
    //Versus game
  } else if (button === "versus") {
    totalscoresessionversus
      .distinct("group", { session: versusSession })
      .then((doc) => {
        let scores = JSON.stringify(doc);
        res.json({ scores: scores, isVersusGame: true });
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    let multipleScoreMap = new Map();
    //get results by session
    totalscoresession
      .find({ session: session })
      .then((session) => {
        session.forEach((player) => {
          multipleScoreMap.set(player.pseudo, player.score);
        });
        //sort the map
        let mapAsc = new Map([...multipleScoreMap.entries()].sort((a, b) => b[1] - a[1]));
        let mapStr = JSON.stringify(mapAsc, replacer);
        res.json({ scores: mapStr });
      })
      .catch((error) => {
        console.log(error.message);
      });
  }
};

//Prepare Map for JSON.stringify
function replacer(key, value) {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}
