const gamecollection = require("../models/game");
const collection = require("../models/user");
const path = require("path");
const fs = require("fs-extra");

/* Store data from DB to HDD */
module.exports.storeData = async function (id, context, firstGameId, currentTestIndex, currentSessionNumber) {
  let dirIn = "";
  let dirOut = "";
  let csvNamePt1 = "";
  let csvNamePt2 = "";
  try {
    switch (context) {
      case "test":
        dirIn = "../data/test/in";
        dirOut = "../data/test/out";
        break;
      case "local":
        dirIn = "../data/local/" + "session_" + currentSessionNumber + "/in";
        dirOut = "../data/local/" + "session_" + currentSessionNumber + "/out";
        break;
      case "web":
        dirIn = "../data/web/in";
        dirOut = "../data/web/out";
        break;

      default:
        break;
    }
    let directoryIn = path.normalize(dirIn);
    let directoryOut = path.normalize(dirOut);
    // JSON
    let game = await gamecollection.findOne({
      _id: id,
    });
    let dataStringified = JSON.stringify(game, null, 2);
    // Check or create directory
    await fs.ensureDir(path.join(__dirname, directoryIn));
    await fs.ensureDir(path.join(__dirname, directoryOut));
    if (context === "web" || context === "local" || (context === "test" && currentTestIndex === 1)) {
      await fs.promises.writeFile(path.join(__dirname, directoryIn, id + "_" + game.data.gameName + ".json"), dataStringified);
    }
    // CSV
    let userData = await collection.findOne({
      gameid: id,
    });
    let csv = "round,playerId,mapX,mapY,value,numberStars,score\n";

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

    //csvNamePt1 = context === "test" ? firstGameId : id;
    csvNamePt1 = id;
    csvNamePt2 = context === "test" ? currentTestIndex : userData.gamename;

    await fs.promises.writeFile(path.join(__dirname, directoryOut, csvNamePt1 + "_" + csvNamePt2 + ".csv"), csv);
  } catch (error) {
    console.log(error);
  }
};
