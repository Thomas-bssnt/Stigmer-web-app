let convertDateMillis = require("../tools/convertDateMillis");
const sanitize = require("mongo-sanitize");
const websequence = require("../models/websequence");
const gamesCollection = require("../models/games");
const gameCollection = require("../models/game");
const mCollection = require("../models/maps");
const bCollection = require("../models/bots");
const rCollection = require("../models/rules");
const path = require("path");
const shuffle = require("../tools/shuffle");
const copy = require("../tools/copy");
const fs = require("fs");

/* GET newgame page. */
module.exports.getNewGame = function (req, res) {
  let env = req.app.get("env");
  //get the values to fill fields in newgame
  gamesCollection
    .find({})
    .then((games) => {
      websequence
        .find({})
        .then((websequence) => {
          websequence = websequence[0];
          // Count files in /web
          const dir = "../data/web/in";
          const directory = path.normalize(dir);
          fs.promises
            .readdir(path.join(__dirname, directory))
            .then((files) => {
              res.render("newgame", {
                title: "Stigmer",
                filesNumber: files.length,
                games: games,
                session: websequence,
                env: env,
              });
            })
            .catch((error) => {
              console.log(`Problem reading files in dir : ${error.message}`);
              // no web directory
              res.render("newgame", {
                title: "Stigmer",
                filesNumber: "pas de dossier web",
                games: games,
                session: websequence,
                env: env,
              });
            });
        })

        .catch((error) => {
          console.log(`Problem reading session in DB : ${error.message}`);
        });
    })
    .catch((error) => {
      console.log(`Problem reading game in DB : ${error.message}`);
    });
};
/* POST newgame page. */
//create or update a web game sequence
module.exports.addWebGameList = function (req, res) {
  let randomGame = sanitize(req.body.randomGame);
  let web = JSON.parse(sanitize(req.body.web));
  let webMultipleSelect = sanitize(web.webMultipleSelect);
  let session = sanitize(webMultipleSelect);
  websequence
    .find({})
    .then((list) => {
      if (list.length == 0) {
        websequence.insert({
          session: session,
          randomGame: randomGame,
        });
      } else {
        websequence
          .update(
            {},
            {
              $set: {
                session: webMultipleSelect,
                randomGame: randomGame,
              },
            }
          )
          .catch((error) => {
            console.log(error.message);
          });
      }
      res.status(202).send();
    })
    .catch((error) => {
      console.log(`Problem updating sequence session in DB : ${error.message}`);
    });
};

//XHR create new local game
module.exports.addGame = async function (req, res) {
  let buttonEventOrig = req.body.buttonEventOrig;
  let humanPlayerNumber = parseInt(sanitize(req.body.humanPlayerNumber));
  let currentSessionNumber = parseInt(sanitize(req.body.currentSessionNumber));
  let local = JSON.parse(sanitize(req.body.local));
  let acceptedPlayers = sanitize(local.localMultipleSelect);
  let gameName = sanitize(req.body.gameName);
  let simulation = req.body.simulation === "true" ? true : false;
  let synchronised = req.body.synchronised === "true" ? true : false;
  let versus = req.body.versus === "true" ? true : false;
  //check game params in DB
  try {
    let game = await gamesCollection.findOne({
      gameName: gameName,
    });

    let players = [];
    game.bots = [];
    game.rule = "";
    game.versus = versus;
    game.simulation = simulation;
    game.synchronised = synchronised;

    //check map params in DB
    let map = {};
    //Create a game with the previous local game map
    if (buttonEventOrig === "newGameWithSameMap") {
      map = await gameCollection.aggregate([
        { $match: { "data.gameContext": "local" } },
        { $sort: { _id: -1 } },
        { $limit: 1 },
        { $project: { "data.map": 1 } },
      ]);
      game.map = map[0].data.map;
      //Create a game with a new map
    } else {
      map = await mCollection.findOne({
        mapName: game.mapSelect,
      });
      game.map = map;
      let array = [];
      if (game.randomMS1 === "on" || game.randomMS2 === "on") {
        array = copy.deepCopy(map.map);
      }

      //shuffle the map at the beginning  of the game
      if (game.randomMS1 === "on") {
        game.map.map = shuffle.shuffleArray(map.map);
      }
      //shuffle the map at each round of the game
      if (game.randomMS2 === "on") {
        game.shuffledArrays = [];
        for (let i = 1; i < game.numberRounds; i++) {
          let tab = shuffle.shuffleArrayXY(array, i);
          game.shuffledArrays.push(tab);
        }
      }
    }

    //check rule params in DB
    let rule = await rCollection.findOne({
      ruleName: game.rulesSelect,
    });

    game.rule = rule;
    //check bots params in DB
    let bot = await bCollection.find({});

    bot.forEach((element) => {
      for (i = 0; i < game.botsList.length; i++) {
        if (game.botsList[i].numberOfBots != 0 && game.botsList[i].name == element.botName) {
          for (let j = 0; j < game.botsList[i].numberOfBots; j++) {
            game.bots.push(element);
          }
        }
      }
    });

    //unique ID in ms
    let id = new Date().getTime();
    let date = convertDateMillis.getDate(id);

    //Store the game in db
    await gameCollection.insert({
      _id: id,
      date: date,
      gameStartDate: "",
      gameEndDate: "",
      players: players,
      data: game,
    });

    res.json({
      gameid: id,
      data: game,
      name: game.gameName,
      acceptedPlayers: acceptedPlayers,
      humanPlayerNumber: humanPlayerNumber,
      currentSessionNumber: currentSessionNumber,
    });
  } catch (error) {
    console.log(error);
  }
};
