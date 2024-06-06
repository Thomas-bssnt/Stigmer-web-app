let convertDateMillis = require("../tools/convertDateMillis");
let shuffle = require("../tools/shuffle");
const copy = require("../tools/copy");
let sanitize = require("mongo-sanitize");
const websequence = require("../models/websequence");
const gamesCollection = require("../models/games");
const gamecollection = require("../models/game");
const mCollection = require("../models/maps");
const bCollection = require("../models/bots");
const rCollection = require("../models/rules");

// ! important : Contact email
const contact = "stigmer@irsamc.ups-tlse.fr";

// XHR Contact email
module.exports.contact = function (req, res) {
  res.json({
    contact: contact,
  });
};

//Launch a web game
module.exports.playWebGames = function (req, res) {
  let currentGameIndex;
  let sessionLength;
  if (req.body.currentGameIndex == undefined) {
    currentGameIndex = 0;
  } else {
    currentGameIndex = parseInt(req.body.currentGameIndex);
  }

  if (req.body.sessionLength != undefined) {
    sessionLength = parseInt(req.body.sessionLength);
  } else {
    sessionLength = 1;
  }

  let pseudo;
  let random;
  let randomList;
  let gameName = "";
  let testGameName = sanitize(req.body.testGameName);
  let demoGameName = sanitize(req.body.demoGameName);
  let playerInfo = {};
  let test = sanitize(req.body.test);
  let demo = sanitize(req.body.demo);
  test = req.body.test === "true" ? true : false;
  demo = req.body.demo === "true" ? true : false;
  let firstGameId = sanitize(req.body.firstGameId);
  //let ruleTopScore = [];
  // web game
  if (!test && !demo) {
    pseudo = sanitize(req.body.pseudo);
    random = JSON.parse(sanitize(req.body.random));
    randomList = random.randomList;
    let playerGender = sanitize(req.body.playerGender);
    let playerAge = parseInt(sanitize(req.body.playerAge));
    playerInfo.playerAge = playerAge;
    playerInfo.playerGender = playerGender;
  }

  //Do a series of games randomly or sequentially
  //check the game name
  if (currentGameIndex < sessionLength && sessionLength != 0) {
    websequence
      .find({}, {})
      .then((session) => {
        if (!test && !demo) {
          sessionLength = session[0].session.length;
          sessionList = session[0].session;
          randomGame = session[0].randomGame == "true" ? true : false;
        }
        //demo
        if (demo) {
          gameName = demoGameName;
          //test
        } else if (test) {
          gameName = testGameName;
          //end sequence
        } else if (currentGameIndex == 0 && randomGame) {
          randomIndex = Math.floor(Math.random() * Math.floor(sessionLength));
          gameName = sessionList[randomIndex];
          sessionList.splice(randomIndex, 1);
          randomList = sessionList;
          //end game in sequence
        } else if (currentGameIndex != 0 && randomGame) {
          randomIndex = Math.floor(Math.random() * Math.floor(randomList.length));
          gameName = randomList[randomIndex];
          randomList.splice(randomIndex, 1);
          //regular game
        } else {
          gameName = sessionList[currentGameIndex];
        }
        gameName = sanitize(gameName);
        //check game params in DB
        gamesCollection
          .findOne({
            gameName: gameName,
          })
          .then((game) => {
            game.bots = [];
            game.rule = "";
            //check map params in DB
            mCollection
              .findOne({
                mapName: game.mapSelect,
              })
              .then((map) => {
                game.map = map;
                let array = copy.deepCopy(map.map);
                //shuffle the array at the beginning  of the game
                if (game.randomMS1 === "on") {
                  game.map.map = shuffle.shuffleArray(map.map);
                }

                //shuffle the array at each round of the game
                if (game.randomMS2 === "on") {
                  game.shuffledArrays = [];
                  for (let i = 1; i < game.numberRounds; i++) {
                    let tab = shuffle.shuffleArrayXY(array, i);

                    game.shuffledArrays.push(tab);
                  }
                }

                //check rule params in DB
                rCollection
                  .findOne({
                    ruleName: game.rulesSelect,
                  })
                  .then((rule) => {
                    game.rule = rule;
                    //check bots params in DB
                    bCollection
                      .find({})
                      .then((bot) => {
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
                        //player pseudo with id
                        if (test) {
                          pseudo = "test";
                        } else if (pseudo == undefined) {
                          pseudo = "webPlayer_" + id;
                        } else {
                          pseudo = pseudo;
                        }
                        if (firstGameId == undefined) {
                          firstGameId = id;
                        } else {
                          firstGameId = firstGameId;
                        }
                        let players = {};
                        playerInfo.playerPseudo = pseudo;
                        players.playerInfo = playerInfo;
                        gamecollection.insert({
                          _id: id,
                          date: date,
                          players: players,
                          data: game,
                        });
                        //response
                        res.json({
                          gameid: id,
                          data: game,
                          name: game.gameName,
                          pseudo: pseudo,
                          firstGameId: firstGameId,
                          currentGameIndex: currentGameIndex,
                          sessionLength: sessionLength,
                          randomList: randomList,
                        });
                      })
                      .catch((error) => {
                        console.log(`Problem reading bot in DB : ${error.message}`);
                      });
                  })
                  .catch((error) => {
                    console.log(`Problem reading rule in DB : ${error.message}`);
                  });
              })
              .catch((error) => {
                console.log(`Problem reading map in DB : ${error.message}`);
              });
          })
          .catch((error) => {
            console.log(`Problem reading game in DB : ${error.message}`);
          });
      })
      .catch((error) => {
        console.log(`Problem reading session in DB : ${error.message}`);
      });
  } else {
    res.render("web", {
      title: "Stigmer",
    });
  }
};
