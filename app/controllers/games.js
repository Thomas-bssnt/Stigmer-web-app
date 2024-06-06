const collection = require("../models/games");
const mCollection = require("../models/maps");
const bCollection = require("../models/bots");
const rCollection = require("../models/rules");
const sanitize = require("mongo-sanitize");

/* GET games page. */
module.exports.getGames = function (req, res) {
  collection
    .find({})
    .then((games) => {
      mCollection
        .find({})
        .then((maps) => {
          games.maps = maps;
          bCollection
            .find({})
            .then((bots) => {
              games.bots = bots;
              rCollection
                .find({})
                .then((rules) => {
                  games.rules = rules;
                  res.render("games", {
                    title: "Stigmer Games",
                    games: games,
                  });
                })
                .catch((error) => {
                  console.log(error.message);
                });
            })
            .catch((error) => {
              console.log(error.message);
            });
        })
        .catch((error) => {
          console.log(error.message);
        });
    })
    .catch((error) => {
      console.log(error.message);
    });
};

/* Post games page. */
// CRUD for games values in DB
module.exports.postGames = function (req, res) {
  let gamesButton = sanitize(req.body.gamesButton);
  let altGameName = sanitize(req.body.altGameName);
  let gameName = sanitize(req.body.gameName);
  let gameContext = sanitize(req.body.gameContext);
  let numberRounds = parseInt(sanitize(req.body.numberRounds));
  let numberCellsOpenedPerRound = parseInt(sanitize(req.body.numberCellsOpenedPerRound));
  let numberPlayers = parseInt(sanitize(req.body.numberPlayers));
  let mapSelect = sanitize(req.body.mapSelect);
  let rulesSelect = sanitize(req.body.rulesSelect);
  let botsNumberList = sanitize(req.body.botsNumberList);
  let botsNameList = sanitize(req.body.botsNameList);
  let evaporation = sanitize(req.body.evaporation);
  let randomMS1 = sanitize(req.body.randomMS1);
  let randomMS2 = sanitize(req.body.randomMS2);
  //we need an array !
  if (typeof req.body.botsNumberList == "string") {
    let botsNumberListTemp = botsNumberList;
    botsNumberList = [];
    botsNumberList.push(botsNumberListTemp);
    let botsNameListTemp = botsNameList;
    botsNameList = [];
    botsNameList.push(botsNameListTemp);
  }

  let botsList = [];
  // Create bots list
  for (let i = 0; i < botsNumberList.length; i++) {
    let Gamebots = {};
    Gamebots.name = botsNameList[i];
    Gamebots.numberOfBots = botsNumberList[i];
    botsList.push(Gamebots);
  }
  let allBots = 0;
  botsList.forEach((element) => {
    allBots += parseInt(element.numberOfBots);
  });

  switch (gamesButton) {
    //click on create
    case "create":
      //Auto Increment
      collection
        .find(
          {
            gameContext: gameContext,
          },
          {}
        )
        .then((games) => {
          let autoIncrement = 0;
          games.forEach((element) => {
            let lastChar = element.gameName.substring(element.gameName.length - 1);
            lastChar = parseInt(lastChar);
            if (lastChar >= autoIncrement) {
              autoIncrement = lastChar;
            }
          });

          autoIncrement = autoIncrement + 1;

          //Create game name
          //Game's context
          let namePart = gameContext.substring(0, 1).toUpperCase();
          //Game's Rule
          let namePart1 = rulesSelect.substring(0, 1).toUpperCase() + rulesSelect.substring(rulesSelect.length - 1);
          //Game's map
          let namePart2 = null;
          let mapSelectName = mapSelect.split("_")[0];
          if (mapSelectName === "random" || mapSelectName === "demo") {
            namePart2 = "M" + mapSelect.substring(0, 1).toUpperCase() + mapSelect.substring(mapSelect.length - 1);
            //Continuous map
          } else {
            namePart2 =
              "M" +
              mapSelect.substring(0, 1).toUpperCase() +
              mapSelect.split("_")[0].substring(mapSelect.split("_")[0].length - 1) +
              "-" +
              mapSelect.substring(mapSelect.length - 1);
          }
          //Game's number of bots
          let namePart3 = allBots + "B";
          gameName = namePart + "_" + namePart1 + "_" + namePart2 + "_" + namePart3 + "_" + autoIncrement;

          if (gameContext) {
            //Store in DB
            collection
              .insert({
                gameContext: gameContext,
                gameName: gameName,
                altGameName: altGameName,
                numberRounds: numberRounds,
                numberCellsOpenedPerRound: numberCellsOpenedPerRound,
                numberPlayers: numberPlayers,
                mapSelect: mapSelect,
                rulesSelect: rulesSelect,
                botsList: botsList,
                evaporation: evaporation,
                randomMS1: randomMS1,
                randomMS2: randomMS2,
              })
              .then(() => {
                res.redirect(req.pageContext + "/games");
              })
              .catch((error) => {
                console.log(error.message);
              });
          }
        })
        .catch((error) => {
          console.log(error.message);
        });

      break;
    //click on update
    case "update":
      //update DB
      collection
        .update(
          {
            gameName: gameName,
          },
          {
            $set: {
              gameContext: gameContext,
              gameName: gameName,
              altGameName: altGameName,
              numberRounds: numberRounds,
              numberCellsOpenedPerRound: numberCellsOpenedPerRound,
              numberPlayers: numberPlayers,
              mapSelect: mapSelect,
              rulesSelect: rulesSelect,
              botsList: botsList,
              evaporation: evaporation,
              randomMS1: randomMS1,
              randomMS2: randomMS2,
            },
          }
        )
        .then(() => {
          res.redirect(req.pageContext + "/games");
        })
        .catch((error) => {
          console.log(error.message);
        });

      break;
    //click on delete
    case "delete":
      //remove fields in DB
      collection
        .findOneAndDelete({
          gameName: gameName,
        })
        .then(() => {
          res.redirect(req.pageContext + "/games");
        })
        .catch((error) => {
          console.log(error.message);
        });

      break;
  }
};

//XHR refresh the values of fields in games
module.exports.gameValue = function (req, res) {
  let gameName = sanitize(req.body.gameName);
  collection
    .findOne({
      gameName: gameName,
    })
    .then((games) => {
      res.send(games);
    })
    .catch((error) => {
      console.log(error.message);
    });
};
