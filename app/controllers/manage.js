const fs = require("fs-extra");
const path = require("path");
const collection = require("../models/user");
const gamecollection = require("../models/game");
const topScore = require("../models/topscore");
const totalScoreSession = require("../models/totalscoresession");
const totalscoresessionversus = require("../models/totalscoresessionversus");
const { archive } = require("../hdd/archive");
const adminPass = require("../passwords/admin");
const { restoreDataFromDb } = require("../hdd/backUp");

// GET manage page
module.exports.getManage = function (req, res) {
  // Count files in /web
  const dir = "../archives";
  const directory = path.normalize(dir);
  fs.promises
    .readdir(path.join(__dirname, directory))
    .then((files) => {
      res.render("manage", {
        title: "Gestion des données",
        files: files,
      });
    })
    .catch((error) => {
      console.log(`Problem reading files in dir : ${error.message}`);
      // no web directory
      let files = [];
      res.render("manage", {
        title: "Gestion des données",
        files: files,
      });
    });
};

//POST manage page
//delete data directory from HDD
module.exports.deleteData = async function (req, res) {
  const dir = "../data";
  const directory = path.normalize(dir);

  try {
    if (req.body.pwd === adminPass) {
      await fs.remove(path.join(__dirname, directory));
      res.json({
        isDeleted: true,
      });
    } else throw "error";
  } catch (error) {
    res.json({
      isDeleted: false,
    });
  }
};

//POST manage page
//delete archive directory from HDD
module.exports.deleteArchive = async function (req, res) {
  const dir = "../archives";
  const directory = path.normalize(dir);

  try {
    if (req.body.pwd === adminPass) {
      await fs.remove(path.join(__dirname, directory));
      res.json({
        isDeleted: true,
      });
    } else throw "error";
  } catch (error) {
    res.json({
      isDeleted: false,
    });
  }
};

//POST manage page
//delete gamecollection and usercollection  from DB
module.exports.deleteDB = async function (req, res) {
  try {
    if (req.body.pwd === adminPass) {
      await collection.drop();
      await gamecollection.drop();
      await totalScoreSession.drop();
      await totalscoresessionversus.drop();
      res.json({
        isDeleted: true,
      });
    } else throw "error";
  } catch (error) {
    res.json({
      isDeleted: false,
    });
  }
};

//POST manage page
//Create archive directory from data directory
module.exports.createArchive = async function (req, res) {
  let file;
  try {
    file = await archive();
    if (file) {
      res.json({
        isCreated: true,
        file: file,
      });
    } else throw "error";
  } catch (error) {
    res.json({
      isCreated: false,
    });
  }
};

module.exports.resetTopScore = function (req, res) {
  if (req.body.pwd === adminPass) {
    topScore
      .update({}, { $set: { scoreArray: [] } }, { multi: true })
      .then(() => {
        res.json({
          isDeleted: true,
        });
      })
      .catch(() => {
        res.json({
          isDeleted: false,
        });
      });
  } else {
    res.json({
      isDeleted: false,
    });
  }
};

module.exports.allLocalGames = async function (req, res) {
  try {
    await restoreDataFromDb();
    res.json({
      isDeleted: true,
    });
  } catch (error) {
    res.json({
      isDeleted: false,
    });
  }
};
