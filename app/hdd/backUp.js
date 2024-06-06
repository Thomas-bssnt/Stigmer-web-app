const gamecollection = require("../models/game");
const collection = require("../models/user");
const path = require("path");
const fs = require("fs-extra");
const { getDateHM } = require("../tools/convertDateMillis");

/* Store data from DB to HDD */
module.exports.restoreDataFromDb = async function () {
  let dirIn = "../data/back/in";
  let dirOut = "../data/back/out";

  try {
    let directoryIn = path.normalize(dirIn);
    let directoryOut = path.normalize(dirOut);
    // Check or create directory
    await fs.ensureDir(path.join(__dirname, directoryIn));
    await fs.ensureDir(path.join(__dirname, directoryOut));
    // JSON
    let games = await gamecollection.find({
      "data.gameContext": "local",
    });
    games.forEach(async (game) => {
      let date = "";
      date = getDateHM(game._id);
      try {
        let dataStringified = JSON.stringify(game, null, 2);
        await fs.promises.writeFile(
          path.join(__dirname, directoryIn, game._id + "_" + date + ".json"),
          dataStringified
        );
      } catch (error) {
        console.log(error);
      }
    });

    // CSV
    let usersData = await collection.find({
      gamecontext: "local",
    });
    usersData.forEach(async (userData) => {
      let csv = "round,playerId,mapX,mapY,value,numberStars,score\n";
      let date = "";
      date = getDateHM(userData.gameid);
      try {
        userData.gamestates.forEach(function (state) {
          if (state.player != "start game") {
            csv +=
              state.round +
              "," +
              state.player +
              "," +
              state.x +
              "," +
              state.y +
              "," +
              state.pointreveal +
              "," +
              state.clue +
              "," +
              state.pointgain +
              "\n";
          }
        });
        await fs.promises.writeFile(path.join(__dirname, directoryOut, userData.gameid + "_" + date + ".csv"), csv);
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
