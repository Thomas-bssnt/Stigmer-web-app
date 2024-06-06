/**
 * Module dependencies.
 */
const app = require("../app");
const debug = require("debug")("theraulaz:server");
const collection = require("../models/user");
const gamecollection = require("../models/game");
const totalscoresession = require("../models/totalscoresession");
const totalscoresessionversus = require("../models/totalscoresessionversus");
const sanitize = require("mongo-sanitize");
const { rearrangeArray } = require("../tools/shuffle");
const { isObjectInArray } = require("../tools/isObjectInArray");
const { getClickedCellBot } = require("../bots/getClickedCellBot");
const { storeData } = require("../hdd/dataStorage");
const game = require("../models/game");
const { getDay, getDateWithSecond } = require("../tools/convertDateMillis");

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = require("http").Server(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * io.
 */
const io = require("socket.io")(server);
/**
 * @type {array<game>}
 */
let games = [];

/**
 * @type {array<game>}
 */
let gamesV = [];

/**
 *
 * @type {map<object>}
 */
let gameTurnStatesOfAllTeams = new Map();

/**
 *
 * @type {map<object>}
 */
let colorGames = new Map();

let verbose = false;

io.on("connection", function (socket) {
  //logout socket

  socket.on("disconnect", function () {
    if (verbose) {
      console.log("games :", games.length);
      console.log("gamesV :", gamesV.length);
      console.log("gameTurnStatesOfAllTeams :", gameTurnStatesOfAllTeams.size);
      console.log("colorGames :", colorGames.size);
    }
    console.log("disconnect");
    //remove old games after 30 min
    let date = new Date();
    games.forEach((element) => {
      if (date - element.id > 1000 * 60 * 30) {
        removeGame(element.id);
      }
    });
    games.forEach(function (game) {
      disconnectionOrLogoutRules(game, socket);
    });
  });
  //user logout
  socket.on("logout", function (context) {
    games.forEach(function (game) {
      disconnectionOrLogoutRules(game, socket);
    });
    socket.emit("logged out", context);
  });

  console.log("a user connected");
  socket.emit("all games", games);

  //New game

  socket.on("new game", function (data) {
    let gameData = data.data;
    /**
     * game
     * @type {object}
     * @property {date} id
     * @property {string} name
     * @property {string} altGameName
     * @property {boolean} pause
     * @property {boolean} currentUser
     * @property {array} leaderBoard
     * @property {number} numberPlayers
     * @property {number} round
     * @property {number} nbStar
     * @property {number} nbStarMax
     * @property {number} nbCells
     * @property {number} nbCellMax
     * @property {number} nbRound
     * @property {string} rule
     * @property {number} A
     * @property {number} coefRemainingStars
     * @property {number} coefValueTimesStars
     * @property {number} coefValue
     * @property {string} gameContext
     * @property {number} time
     * @property {number} timeractif
     * @property {number} waitMaxPlayer
     * @property {array} data
     * @property {array} acceptedPlayers
     * @property {string} currentSessionNumber
     * @property {string} testSessionLength
     * @property {string} randomMS1
     * @property {string} randomMS1
     * @property {array} shuffledArrays
     * @property {number} evaporation
     * @property {boolean} versus
     * @property {boolean} simulation
     * @property {boolean} synchronised
     */
    let game = {
      id: data.gameid,
      name: gameData.gameName,
      altGameName: gameData.altGameName,
      pause: true,
      currentUser: null,
      leaderBoard: [],
      numberPlayers: gameData.numberPlayers,
      round: 1,
      nbStar: gameData.rule.maxNumberOfStarsPerRound,
      nbStarMax: 5,
      nbCells: gameData.numberCellsOpenedPerRound,
      nbCellMax: gameData.numberCellsOpenedPerRound,
      nbRound: gameData.numberRounds,
      currentStep: 0,
      rule: gameData.rule.rule,
      A: 0,
      coefRemainingStars: gameData.rule.coefRemainingStars,
      coefValueTimesStars: gameData.rule.coefValueTimesStars == "on" ? 1 : 0,
      coefValue: gameData.rule.coefValue == "on" ? 1 : 0,
      gameContext: gameData.gameContext,
      timeractif: 0,
      time: 20,
      waitMaxPlayer: 1,
      randomMS1: gameData.randomMS1,
      randomMS2: gameData.randomMS2,
      evaporation: gameData.evaporation,
      shuffledArrays: gameData.shuffledArrays,
      data: [],
      endGame: false,
      versus: gameData.versus,
      simulation: gameData.simulation,
      synchronised: gameData.synchronised,
      updateCount: 0,
      inGamePlayers: [],
    };
    if (data.acceptedPlayers) {
      game.acceptedPlayers = data.acceptedPlayers;
    }
    let humanPlayerNumber;
    if (data.humanPlayerNumber) {
      humanPlayerNumber = parseInt(data.humanPlayerNumber);
    }
    if (data.currentSessionNumber) {
      game.currentSessionNumber = data.currentSessionNumber;
    }
    if (data.sessionLength) {
      game.testSessionLength = data.sessionLength;
    }
    if (game.synchronised) {
      gameTurnStatesOfAllTeams.set(game.id, false);
    }
    let mapv = gameData.map.map;

    for (let i = 0; i < mapv.length; i++) {
      game.data[i] = [];
      for (let j = 0; j < mapv.length; j++) {
        game.data[i][j] = 0;
      }
    }
    let colorGame = {
      isTheGameComplete: false,
      data: [],
    };

    colorGames.set(game.id, colorGame);

    /*Store game*/
    games.push(game);
    /*Store game V*/
    let gameV = {
      gameid: game.id,
      dataPoints: mapv,
    };
    gamesV.push(gameV);
    game.Ne = 0;
    gameData.botsList.forEach((element) => {
      game.Ne += parseInt(element.numberOfBots);
    });
    //Game with robots
    if (game.Ne > 0) {
      //avalaible pseudo array
      let avalaibleBotsNames = [];
      //we choose the greatest number between number of player or number of human
      if (game.gameContext == "local") {
        if (game.numberPlayers > humanPlayerNumber) {
          avalaibleBotsNamesLength = game.numberPlayers;
        } else {
          avalaibleBotsNamesLength = humanPlayerNumber;
        }
        //all avalaible pseudo array
        for (let i = 0; i < avalaibleBotsNamesLength; i++) {
          avalaibleBotsNames.push("J" + (i + 1));
        }
      }
      /**
       * Add bot player(s)
       */
      for (let i = 0; i < game.Ne; i++) {
        /**
         *player
         * @type {object}
         * @property {date} id
         * @property {number} score
         * @property {object} botParam
         * @property {array} botParam.bestCellsArray
         * @property {array} botParam.roundBestCellsArray
         * @property {array} botParam.alreadyClickedCellsArray
         * @property {string} pseudo
         * @property {number} nbStar
         * @property {number} nbCells
         * @property {boolean} played
         * @property {boolean} inGame
         * @property {array} clue
         * @property {array} clickedCells
         * @property {boolean} isBot
         */
        let player = {};
        player.id = socket.id;
        player.botParam = gameData.bots[i];
        player.botParam.bestCellsArray = [];
        player.botParam.roundBestCellsArray = [];
        player.botParam.alreadyClickedCellsArray = [];
        player.score = 0;
        /**
         * Assignment of robot nicknames or web player nickname
         */
        if (game.gameContext == "web") {
          //web player pseudo
          player.pseudo = i + 2;
        } else if (game.gameContext == "test") {
          player.pseudo = "testBot " + (i + 1);
        } else {
          //remove from array human pseudo
          for (let j = 0; j < avalaibleBotsNames.length; j++) {
            game.acceptedPlayers.forEach((element) => {
              if (element == avalaibleBotsNames[j]) {
                avalaibleBotsNames.splice(j, 1);
              }
            });
          }
          //random
          let randomIndex = Math.floor(Math.random() * Math.floor(avalaibleBotsNames.length));
          player.pseudo = avalaibleBotsNames[randomIndex];
          //remove from array new pseudo
          for (let j = 0; j < avalaibleBotsNames.length; j++) {
            if (player.pseudo == avalaibleBotsNames[j]) {
              avalaibleBotsNames.splice(j, 1);
            }
          }
        }
        player.nbStar = game.nbStar;
        player.nbCells = game.nbCells;
        player.played = false;
        player.inGame = true;
        player.clickedCells = [];
        player.isBot = true;

        game.leaderBoard.push(player);
      }
    }

    if (data.testData) {
      game.currentTestIndex = data.testData.currentTestIndex;
      game.firstGameId = data.testData.firstGameId;
    } else {
      let testData = {};
      game.currentTestIndex = 1;
      game.firstGameId = data.gameid;

      testData.firstGameId = game.firstGameId;
      testData.currentTestIndex = game.currentTestIndex;
      testData.gameId = game.id;
      data.testData = testData;
    }

    /*Store state on db*/
    /**
     *state
     * @type {object}
     * @property {date} pointreveal
     * @property {number} clue
     * @property {number} pointgain
     * @property {string} player
     * @property {string} data
     * @property {number} round
     * @property {number} x
     * @property {number} y
     * @property {player} player
     */
    let state = {};
    state.pointreveal = 0;
    state.clue = 0;
    state.pointgain = 0;
    state.player = "start game";
    state.data = JSON.stringify(game.data);
    state.round = 1;
    state.x = "-";
    state.y = "-";
    let day = getDay(data.gameId);
    collection
      .insert({
        gameid: game.id,
        gamename: game.name,
        date: day,
        gamecontext: game.gameContext,
        rule: game.rule,
        isTheGameComplete: false,
        gamestates: [state],
      })
      .then(() => {
        if (game.gameContext === "test") {
          io.emit("new game available test", data.testData);
        }
        if (game.gameContext === "local") {
          io.emit("new game available", game);
          socket.emit("new game created");
        }
        if (game.gameContext === "web") {
          socket.emit("new game available web", game.id);
        }
        if (game.gameContext === "demo") {
          socket.emit("new game available demo", game.id);
        }
      })
      .catch((error) => {
        console.log(error.message);
      });
  });
  /**
   *Human Player
   */
  socket.on("login", function (data) {
    let game = {};
    if (data.userAge) {
      let gameStartDate = getDateWithSecond(new Date());
      let playerInfo = {};
      playerInfo.playerPseudo = data.pseudo;
      playerInfo.playerAge = data.userAge;
      playerInfo.playerGender = data.userGender;

      //Store data in DB
      gamecollection
        .update(
          {
            _id: parseInt(sanitize(data.gameId)),
          },
          {
            $push: {
              players: playerInfo,
            },
            $set: { gameStartDate: gameStartDate },
          }
        )
        .catch((error) => {
          console.log(error.message);
        });
    }

    //search for the game in the games array by the id
    game = findGame(data.gameId);
    let player = {};
    let playerPlaying = null;
    let pseudoAvailable = true;
    let maxPlayer = false;

    //Check if the player is already registered in a game => 2 players with same pseudo
    game.leaderBoard.forEach(function (playerCurrent) {
      if (playerCurrent.pseudo === data.pseudo) {
        pseudoAvailable = false;
      }
    });
    /**
     * Human player
     */
    if (pseudoAvailable) {
      game.inGamePlayers.push(data.pseudo);
      //Check if there is a free place in the game
      if (game.leaderBoard.length < game.numberPlayers) {
        player.id = socket.id;
        player.score = 0;
        player.pseudo = data.pseudo;
        player.nbStar = game.nbStar;
        player.nbCells = game.nbCells;
        player.played = false;
        player.inGame = true;
        player.clickedCells = [];
        player.isBot = false;

        //add a player
        game.leaderBoard.push(player);
      } else {
        //the game is full
        maxPlayer = true;
        socket.emit("max player");
      }
      if (!maxPlayer) {
        if (game.currentUser === null) {
          game.currentUser = player.id;
        }
        //join the room
        socket.join(game.id);
        let colorGame = initColorGame(game.data);
        socket.emit("join game", game, colorGame, player, playerPlaying);
        io.in(game.id).emit("game updated", game);
        io.emit("update nb player", game);
      }
    } else {
      socket.emit("pseudo not available");
    }

    if (game.gameContext === "test") {
      startBots(game);
    }
    if (game.synchronised) {
      let flag = true;
      games.forEach((game) => {
        let isAllPlayersInGame = false;
        if (game.gameContext === "local" && game.acceptedPlayers.length === game.inGamePlayers.length) {
          isAllPlayersInGame = true;
        }
        flag = flag && isAllPlayersInGame;
      });
      if (flag) {
        for (const key of gameTurnStatesOfAllTeams.keys()) {
          io.in(key).emit("end of waiting for other teams");
        }
      }
    } else {
      if (game.leaderBoard.length === game.numberPlayers && pseudoAvailable) {
        io.in(game.id).emit("end of waiting for players");
        io.emit("display round state", game.id, game.round);
      }
    }
  });

  /**
   * Receive event from client : click grid
   * @param {clickedCell} msg
   * @param {string} pseudo
   */
  socket.on("click grid", function (msg, pseudo) {
    let game = {};
    game = findGame(msg.id);

    if (game !== null) {
      if (game.leaderBoard.length == game.numberPlayers) {
        let player = null;
        player = findPlayer(game, socket, pseudo);
        if (player !== null) {
          // Check if he already clicked on this cell
          if (!isObjectInArray(player.clickedCells, msg.x, msg.y)) {
            if (player.nbCells > 0) {
              // refresh player's attributes
              player.nbCells--;
              let data = {};
              data.y = msg.y;
              data.x = msg.x;
              data.value = findGamePoint(game.id, msg.y, msg.x);
              data.game = game;
              let clickedCell = {};
              clickedCell.x = msg.x;
              clickedCell.y = msg.y;
              player.clickedCells.push(clickedCell);
              socket.emit("reveal cell", data, player);

              if (game.pause) {
                startBots(game);
                game.pause = false;
              }
            }
          } else {
            socket.emit("cell already clicked");
          }
        }
      }
    } else {
      console.log("no game with id " + msg.id);
    }
  });

  /**
   * end round local
   * @param {clickedCell} clickedCell
   * @param {number} clue
   * @param {number} valueCell
   * @param {boolean} timeEnd
   * @param {string} pseudo
   */
  socket.on("end round", function (clickedCell, clue, valueCell, timeEnd, pseudo) {
    let game = {};
    game = findGame(clickedCell.gameId);
    let nextTurn = true;
    let endGame = false;
    if (game.synchronised) {
      gameTurnStatesOfAllTeams.set(game.id, false);
    }
    if (game != null) {
      let player = findPlayer(game, socket, pseudo);
      if (player !== null) {
        scoreCalc(game, clickedCell, valueCell, clue, player, nextTurn, socket, endGame);
      }
    }
  });

  /**
   * end round web
   * @param {clickedCell} clickedCell
   * @param {number} clue
   * @param {number} valueCell
   * @param {boolean} timeEnd
   * @param {string} pseudo
   */
  socket.on("end round web", function (clickedCell, clue, valueCell, timeEnd, pseudo) {
    let game = {};
    game = findGame(clickedCell.gameId);
    let nextTurn = true;
    let endGame = false;
    if (game != null) {
      let gameV = findGameV(game.id);
      if (!timeEnd) {
        valueCell = gameV.dataPoints[clickedCell.y][clickedCell.x];
      }
      let player = findPlayer(game, socket, pseudo);
      if (player !== null) {
        scoreCalc(game, clickedCell, valueCell, clue, player, nextTurn, socket, endGame);
      }
    }
  });

  socket.on("allow player to play", function () {
    io.emit("game allowed");
  });

  socket.on("forbid player to play", function () {
    io.emit("game forbidden");
  });

  /**
   * remove one selected game
   * @param {date} gameid
   */
  socket.on("removed game", function (gameid) {
    //io.in(gameid).emit("logged out", "local");
    io.emit("remove game select", gameid);
    removeGame(gameid);
    removeRoom(gameid);
  });

  /**
   * remove all local games
   * @param {array} gamesToRemove
   */
  socket.on("remove all games", function () {
    let gamesToRemove = [];
    games.forEach((game) => {
      if (game.gameContext === "local") {
        gamesToRemove.push(game.id);
      }
    });
    gamesToRemove.forEach((id) => {
      removeGame(id);
      removeRoom(id);
    });
    io.emit("remove all games select");
    io.emit("logged out", "local");
  });

  socket.on("launch front test", function () {
    io.emit("launched front test");
  });

  socket.on("close front test", function () {
    io.emit("closed front test");
  });
});

/**
 * remove Room
 * @param {date} gameid
 */
function removeRoom(gameid) {
  io.socketsLeave(gameid);
}

/**
 * function disconnectionOrLogoutRules
 * @param {game} game
 * @param {socket} socket
 */
function disconnectionOrLogoutRules(game, socket) {
  socket.leave(game.id);
  let inGamePlayers = [];

  for (let player of game.leaderBoard) {
    if (player.id === socket.id && !player.isBot) {
      player.inGame = false; //after the user click on logout or close/refresh the page, the player is no longer in the game
    }
    if (player.inGame) {
      inGamePlayers.push(player.pseudo);
    }
  }

  for (let player of game.leaderBoard) {
    // !!! Bots have same socket id as admin
    if (player.id === socket.id && !player.isBot) {
      switch (game.gameContext) {
        case "local":
          //Only one player in the local game
          if (game.acceptedPlayers.length === 1) {
            io.emit("remove game select", game.id);
            removeGame(game.id);
          }
          //One player quit during or at the end of a local game
          else if (!game.endGame) {
            socket.emit("remove game select", game.id);
            io.to(game.id).emit("force disconnection", game.id);
          }
          //Player(s) quit game at the end of a local game
          else if (inGamePlayers.length === game.Ne) {
            io.emit("remove game select", game.id);
            removeGame(game.id);
          }
          break;
        case "web":
          //Only one player in the web game
          removeGame(game.id);

          break;
        case "demo":
          //Only one player in the demo game
          removeGame(game.id);
          break;
        default:
          break;
      }
      //quit the room
    }
  }
}

/**
 * remove game
 * @param {date} gameid
 */
function removeGame(gameid) {
  gameTurnStatesOfAllTeams.delete(gameid);
  colorGames.delete(gameid);
  games.forEach(function (item, index, object) {
    if (item.id == gameid) {
      object.splice(index, 1);
      console.log("Game removed from games: " + gameid);
    }
  });
  gamesV.forEach(function (item, index, object) {
    if (item.gameid == gameid) {
      object.splice(index, 1);
      console.log("Game removed from gamesV: " + gameid);
    }
  });
}

/**
 * Find a game in games[]
 * @param {date} id
 * @returns {game}
 */
function findGame(id) {
  let result = null;
  games.forEach(function (item) {
    if (item.id == id) {
      result = item;
    }
  });
  return result;
}

/**
 * Find a game in gamesV[]
 * @param {date} id
 * @returns {game}
 */
function findGameV(id) {
  let result = null;
  gamesV.forEach(function (item) {
    if (item.gameid == id) {
      result = item;
    }
  });
  return result;
}

/**
 * Find a specific player
 * @param {game} game
 * @param {socket} socket
 * @param {string} pseudo
 * @returns {player}
 */
function findPlayer(game, socket, pseudo) {
  let player = null;
  game.leaderBoard.forEach(function (playerCurrent) {
    if (playerCurrent.id === socket.id && playerCurrent.pseudo === pseudo) {
      player = playerCurrent;
    }
  });
  return player;
}

/**
 * Reset player's attributes
 * @param {game} game
 */
function resetPlayed(game) {
  game.leaderBoard.forEach(function (player) {
    if (player.inGame) {
      player.played = false;
    }
    player.nbCells = game.nbCells;
    player.nbStar = game.nbStar;
  });
}

/**
 * Find the cell value
 * @param {date} gameId
 * @param {number} playerId
 * @param {string} playerPseudo
 * @param {number} y
 * @param {number} x
 * @returns {number}
 */
function findGamePoint(gameId, y, x) {
  return findGameV(gameId).dataPoints[y][x];
}

/**
 * map color
 * @param {game} gameData
 * @param {number} evaporation
 * @returns {colorGame}
 */
function createColorGame(gameData, evaporation) {
  let colorGame = { data: [] };
  evaporation = evaporation > 100 ? 1 : 1 - 1 / evaporation;
  // Initialization of the table
  let sumClues = 0;
  for (let i = 0; i < gameData.length; i++) {
    colorGame.data[i] = [];
    for (let j = 0; j < gameData.length; j++) {
      colorGame.data[i][j] = gameData[i][j];
      sumClues += gameData[i][j];
      gameData[i][j] = gameData[i][j] * evaporation;
    }
  }

  // Normalization if the sum of clues is not equal to 0
  if (sumClues !== 0) {
    colorGame.allElmtsZero = false;
    for (let i = 0; i < colorGame.data.length; i++) {
      for (let j = 0; j < colorGame.data.length; j++) {
        colorGame.data[i][j] /= sumClues;
      }
    }
  } else {
    colorGame.allElmtsZero = true;
  }
  return colorGame;
}

function initColorGame(gameData) {
  let colorGame = { data: [] };

  // Initialization of the table
  let sumClues = 0;
  for (let i = 0; i < gameData.length; i++) {
    colorGame.data[i] = [];
    for (let j = 0; j < gameData.length; j++) {
      colorGame.data[i][j] = gameData[i][j];
      sumClues += gameData[i][j];
    }
  }
  // Normalization if the sum of clues is not equal to 0
  if (sumClues !== 0) {
    for (i = 0; i < colorGame.data.length; i++) {
      for (j = 0; j < colorGame.data.length; j++) {
        colorGame.data[i][j] /= sumClues;
      }
    }
  }
  return colorGame;
}

/**
 * Launch bots
 * @param {game} game
 * @param {colorGame} colorGame
 */
function startBots(game, colorGame) {
  //if (colorGame) console.table(colorGame.data);
  let nextTurn = true;
  let endGame = false;
  // For all the bots
  game.leaderBoard.forEach(function (player) {
    if (player.isBot) {
      while (player.nbCells > 0 && game.round <= game.nbRound) {
        player.nbCells--;

        // Open a cell
        /**
         * Coordinates of a clicked cell with value
         * @type {object}
         * @property {number} x
         * @property {number} y
         */
        let clickedCell = getCellToOpen(game, colorGame, player);
        player.clickedCells.push(clickedCell);
        let valueCell = findGameV(game.id).dataPoints[clickedCell.y][clickedCell.x];
        addBestCell(player, valueCell, clickedCell);

        // Rate a cell
        let nbStars = getNbStarsToBet(player.botParam.typeOfFunction, player.nbStar, game.nbStarMax, player.botParam.bettingStrategy, valueCell);

        // At the end of the
        if (player.nbCells === 0) {
          sortBestCells(player);
        }

        // Score calculation
        scoreCalc(game, clickedCell, valueCell, nbStars, player, nextTurn, null, endGame);
      }
    }
  });
}

/**
 * Get a cell to open
 * @param {game} game
 * @param {colorgame} colorGame
 * @param {player} player
 * @returns {clickedCell}
 */
function getCellToOpen(game, colorGame, player) {
  // In the first round only explore by color
  if (game.round === 1) {
    return exploreColor(player, game.data, player.botParam, colorGame, player.botParam.bestCellsArray);
  }
  // In the other rounds either reopen the best cell or explore by color
  let index = 2 * (game.nbCellMax - (player.nbCells + 1));
  let criticalValue = parseFloat(player.botParam.visitStrategy[index]);
  let slope = parseFloat(player.botParam.visitStrategy[index + 1]);
  let p = slope * (player.botParam.bestCellsArray[player.nbCells].valueCell - criticalValue) / 99.;
  let random = Math.random();
  if (random < p && game.randomMS2 === null) {
    return player.botParam.bestCellsArray[player.nbCells].clickedCell;
  }
  return exploreColor(player, game.data, player.botParam, colorGame, player.botParam.bestCellsArray);
}

function sortBestCells(player) {
  // Sort
  player.botParam.roundBestCellsArray.sort((a, b) => b.valueCell - a.valueCell);

  // Best cells array for one round memory
  if (player.botParam.oneRoundMemory) {
    player.botParam.bestCellsArray = [...player.botParam.roundBestCellsArray];
  } else {
    player.botParam.roundBestCellsArray.forEach((element) => {
      player.botParam.bestCellsArray.push(element);
    });
    // Sort
    player.botParam.bestCellsArray.sort((a, b) => b.valueCell - a.valueCell);
    // Remove duplicate values
    for (let i = 0; i < player.botParam.bestCellsArray.length - 1; i++) {
      if (
        player.botParam.bestCellsArray[i].clickedCell.x === player.botParam.bestCellsArray[i + 1].clickedCell.x &&
        player.botParam.bestCellsArray[i].clickedCell.y === player.botParam.bestCellsArray[i + 1].clickedCell.y
      )
        player.botParam.bestCellsArray.splice(i, 1);
    }
  }
  // Keep the 3 firsts elements of the array
  player.botParam.bestCellsArray = player.botParam.bestCellsArray.slice(0, 3);

  // Reset roundBestCellsArray
  player.botParam.roundBestCellsArray = [];
}

/**
 * Add the clicked cell to the best cell of a player
 * @param {player} player
 * @param {number} valueCell
 * @param {clickedCell} clickedCell
 */
function addBestCell(player, valueCell, clickedCell) {
  let roundBestCells = {
    valueCell: valueCell,
    clickedCell: clickedCell,
  };
  player.botParam.roundBestCellsArray.push(roundBestCells);
}

/**
 * Explore from colored table
 * @param {player} player
 * @param {game} data
 * @param {object} params
 * @param {number} params.paramVisit1
 * @param {number} params.paramVisit2
 * @param {colorGame} colorGame
 * @param {bestCell} array
 * @param {number} bestCellIndex
 * @returns {clickedCell}
 */
function exploreColor(player, data, params, colorGame, array) {
  let clickedCell = {};
  do {
    clickedCell = getClickedCellBot(data, colorGame, player.clickedCells, array, params);
  } while (Object.keys(clickedCell).length === 0); // If the cell is not free, get another one
  return clickedCell;
}

/**
 * Get the number of stars to bet depending on the betting strategy
 * @param {player.botParam.typeOfFunction} strategyType
 * @param {player.nbStar} nbStarsRemaining
 * @param {number} nbStarsMax
 * @param {player.botParam.bettingStrategy} parameters
 * @param {number} valueCell
 * @returns {number}
 */
function getNbStarsToBet(strategyType, nbStarsRemaining, nbStarsMax, parameters, valueCell) {
  let nbStars = null;
  switch (strategyType) {
    case "linear":
      nbStars = getNbStarsToBetLinear(nbStarsMax, parameters, valueCell);
      break;
    case "tanh":
      nbStars = getNbStarsToBetTanh(nbStarsMax, parameters, valueCell);
      break;
    default:
      break;
  }
  return Math.min(nbStars, nbStarsRemaining); // Can't bet more than the number of stars remaining
}

/**
 * Get the number of stars to bet for the linear betting strategy
 * @param {number} nbStarsMax
 * @param {player.botParam.bettingStrategy} parameters
 * @param {number} valueCell
 * @returns {number}
 */
function getNbStarsToBetLinear(nbStarsMax, parameters, valueCell) {
  let p = parseFloat(parameters[0]) + nbStarsMax * parseFloat(parameters[1]) * valueCell / 99.;
  if (p < 0.) {
    return 0;
  }
  else if (p > nbStarsMax) {
    return 5;
  }
  let pIntegerPart = Math.floor(p);
  if (Math.random() < p - pIntegerPart) {
    return pIntegerPart + 1;
  }
  return pIntegerPart;
}

/**
 * Get the number of stars to bet for the tanh betting strategy
 * @param {number} nbStarsMax
 * @param {player.botParam.bettingStrategy} parameters
 * @param {number} valueCell
 * @returns {number}
 */
function getNbStarsToBetTanh(nbStarsMax, parameters, valueCell) {
  // Compute probabilities
  let P0 = (1. + Math.tanh((parseFloat(parameters[1]) * (valueCell - parseFloat(parameters[0]))) / 99.)) / 2.;
  let PMax = (1. + Math.tanh((parseFloat(parameters[3]) * (valueCell - parseFloat(parameters[2]))) / 99.)) / 2.;
  let PMid = (1. - P0 - PMax) / (nbStarsMax - 1);

  // Construct probability array
  let probabilityArray = [];
  probabilityArray[0] = P0;
  for (let i = 1; i < nbStarsMax; i++) {
    probabilityArray[i] = PMid;
  }
  probabilityArray[nbStarsMax] = PMax;

  // Get the number of stars to bet
  let probabilitySum = probabilityArray[0];
  let random = Math.random();
  let nbStars = 0;
  while (probabilitySum < random) {
    nbStars++;
    probabilitySum += probabilityArray[nbStars];
  }
  return nbStars;
}

/**
 * Score calculation game state storage in db
 * @param {game} game
 * @param {clickedCell} clickedCell
 * @param {number} valueCell
 * @param {number} clue
 * @param {player} player
 * @param {boolean} nextTurn
 * @param {socket} socket
 * @param {boolean} endGame
 */
function scoreCalc(game, clickedCell, valueCell, clue, player, nextTurn, socket, endGame) {
  let colorGame = {};
  colorGame.data = [];
  let Gc = valueCell * clue;
  let Gp = 0;
  // We store clue of the round
  game.data[clickedCell.y][clickedCell.x] = game.data[clickedCell.y][clickedCell.x] + clue;

  if (clickedCell.y === "-" && clickedCell.x === "-") {
    player.nbCells = 0;
  }
  player.nbStar -= clue;
  game.currentStep += 1;
  if (player.nbCells === 0) {
    // RAZ clicked cases
    player.clickedCells = [];
    player.played = true;
    /* Gp */
    Gp = player.nbStar;
    // Check if All players played
    game.leaderBoard.forEach(function (playerCurrent) {
      if (!playerCurrent.played && playerCurrent.inGame) {
        nextTurn = false;
      }
    });
  } else {
    nextTurn = false;
  }
  // Store the next turn state for all games
  if (game.synchronised) {
    gameTurnStatesOfAllTeams.set(game.id, nextTurn);
  }
  if (nextTurn) {
    colorGame = createColorGame(game.data, game.evaporation);
    colorGames.set(game.id, colorGame);
  }
  let G = game.coefRemainingStars * Gp + game.coefValueTimesStars * Gc + valueCell * game.coefValue;
  player.score += Math.round(G);
  if (socket !== null) {
    socket.emit("anim score", player);
    socket.emit("info updated", player);
    socket.emit("score round update", G);
  }
  //Demo game - no DB storage
  ////////////////////////////////////////////////////////////////////////////////////
  if (game.gameContext === "demo") {
    //next round
    if (nextTurn && !endGame) {
      game.round++;
    }
    //end game
    if (game.round > game.nbRound) {
      endGame = true;
    }
    if (nextTurn && !endGame) {
      io.in(game.id).emit("next round", game, colorGame);
      //reset
      resetPlayed(game);
    }
    if (endGame) {
      let data = {};
      data.game = game;
      data.colorGame = colorGame;
      io.in(game.id).emit("end game", data);
      removeGame(game.id);
    }
    ///////////////////////////////////////////////////////////////////////////////////
  } else {
    //state : user game data to store in db
    let state = {};
    state.pointreveal = valueCell;
    state.clue = clue;
    state.pointgain = Math.round(game.coefRemainingStars * Gp + game.coefValueTimesStars * Gc + valueCell * game.coefValue);
    //format pseudo
    if (!player.isBot) {
      state.player = player.pseudo;
    } else {
      state.player = player.pseudo + "_" + player.botParam.botName;
    }
    state.data = JSON.stringify(colorGame.data);
    state.round = game.round;
    state.x = clickedCell.x;
    state.y = clickedCell.y;
    state.currentStep = game.currentStep;
    //Store game state in db
    if (!endGame) {
      collection
        .update(
          {
            gameid: game.id,
          },
          {
            $push: {
              gamestates: {
                $each: [state],
                $sort: { currentStep: 1 },
              },
            },
          }
        )
        .then(() => {
          game.updateCount += 1;
          // Save the game if it finished
          if (game.numberPlayers * game.nbCellMax * game.nbRound === game.updateCount) {
            collection
              .findOneAndUpdate(
                {
                  gameid: sanitize(game.id),
                },
                {
                  $set: { isTheGameComplete: true },
                }
              )
              .catch((error) => {
                console.log(error);
              });
            saveGameHDD(game);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
    //next round
    if (nextTurn && !endGame) {
      game.round++;
    }
    //end game
    if (game.round > game.nbRound) {
      endGame = true;
    }
    if (!nextTurn && !endGame && !player.isBot && game.simulation && player.nbCells) {
      socket.emit("front bot", game.round);
    }
    // /!\ BOTS TEST /!\
    if (endGame) {
      //finish test and test animation
      if (game.gameContext === "test") {
        if (game.testSessionLength === game.currentTestIndex) {
          //notify the user that the test is complete
          io.emit("end test");
        }
        //next test
        if (game.testSessionLength > game.currentTestIndex) {
          //reset
          resetPlayed(game);
          game.updateCount = 0;
          let data = {};
          data.gameId = game.id;
          data.currentTestIndex = game.currentTestIndex + 1;
          data.firstGameId = game.firstGameId;
          // emit data to client
          io.emit("test", data);
        }
      }
    }

    if (nextTurn && !endGame) {
      //reset
      resetPlayed(game);
      // reorganize arrays
      if (game.randomMS2 === "on") {
        colorGame.data = rearrangeArray(colorGame.data, game.shuffledArrays[game.round - 2]);
        colorGames.set(game.id, colorGame);
        game.data = rearrangeArray(game.data, game.shuffledArrays[game.round - 2]);
        findGameV(game.id).dataPoints = rearrangeArray(findGameV(game.id).dataPoints, game.shuffledArrays[game.round - 2]);
      }
      // Syncs all games together --- ROUND
      let turnFlag = true;
      if (game.synchronised) {
        for (const value of gameTurnStatesOfAllTeams.values()) {
          turnFlag = turnFlag && value;
        }
        if (turnFlag) {
          for (const key of gameTurnStatesOfAllTeams.keys()) {
            let synchronisedGame = {};
            let synchronisedColorGame = {};
            synchronisedGame = findGame(key);
            synchronisedColorGame = colorGames.get(key);
            io.in(key).emit("next round", synchronisedGame, synchronisedColorGame);
            io.emit("display round state", synchronisedGame.id, synchronisedGame.round);
            //launch bots
            startBots(synchronisedGame, synchronisedColorGame);
            gameTurnStatesOfAllTeams.set(key, false);
          }
        }
      } else {
        io.in(game.id).emit("next round", game, colorGame);
        io.emit("display round state", game.id, game.round);
        //launch bots
        startBots(game, colorGame);
      }
    }
    // End of the game
    if (endGame && game.gameContext !== "test") {
      //  Save end date in db
      let gameEndDate = getDateWithSecond(new Date());
      gamecollection
        .update(
          {
            _id: parseInt(game.id),
          },
          {
            $set: { gameEndDate: gameEndDate },
          }
        )
        .catch((error) => {
          console.log(error.message);
        });
      game.endGame = true;
      let endGamedata = {};
      endGamedata.game = {};
      endGamedata.colorGame = {};
      endGamedata.game = game;
      endGamedata.colorGame = colorGame;
      if (game.gameContext !== "local") {
        io.in(game.id).emit("end game", endGamedata);
      }

      // Store the score of the real players in db (Versus game)
      if (game.gameContext === "local") {
        if (game.versus) {
          let areGamesOverForAllTeams = true;
          let versusGamesIds = [];
          games.forEach((element) => {
            let flag = false;
            if (element.versus) {
              versusGamesIds.push(element.id);
            }
            if (element.versus && element.endGame) {
              flag = true;
            }
            areGamesOverForAllTeams = areGamesOverForAllTeams && flag;
          });
          let teamScore = 0;
          game.leaderBoard.forEach((player) => {
            teamScore += player.score;
          });
          let sortedAcceptedPlayers = game.acceptedPlayers.sort((a, b) => a.substring(1) - b.substring(1));
          let members = sortedAcceptedPlayers.toString();
          totalscoresessionversus
            .update(
              {
                session: sanitize(game.currentSessionNumber),
                "group.members": members,
              },
              { $inc: { "group.score": teamScore } },
              { upsert: true }
            )
            .catch((error) => {
              console.log(error);
            });
        }
        // Store the score of the real players in db
        let count = 0;
        for (let player of game.leaderBoard) {
          if (!player.isBot) {
            totalscoresession
              .update(
                {
                  pseudo: player.pseudo,
                  session: sanitize(game.currentSessionNumber),
                },
                { $inc: { score: sanitize(player.score) } },
                { upsert: true }
              )
              .catch((error) => {
                console.log(error);
              });
            count++;
            if (count === game.acceptedPlayers.length) {
              // Syncs all games together --- END GAME
              let turnFlag = true;
              if (game.synchronised) {
                for (const value of gameTurnStatesOfAllTeams.values()) {
                  turnFlag = turnFlag && value;
                }
                if (turnFlag) {
                  for (const key of gameTurnStatesOfAllTeams.keys()) {
                    let endSynchronisedGamedata = {};
                    endSynchronisedGamedata.game = {};
                    endSynchronisedGamedata.colorGame = {};
                    endSynchronisedGamedata.game = findGame(key);
                    endSynchronisedGamedata.colorGame = colorGames.get(key);
                    io.in(key).emit("end game", endSynchronisedGamedata);
                  }
                }
              } else {
                io.in(game.id).emit("end game", endGamedata);
              }
            }
          }
        }
      }
    }
  }
}

function saveGameHDD(game) {
  try {
    storeData(game.id, game.gameContext, game.firstGameId, game.currentTestIndex, game.currentSessionNumber);
    if (game.gameContext !== "local") {
      removeGame(game.id);
    }
  } catch (error) {
    console.log(error);
  }
}

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  let bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  let addr = server.address();
  let bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
