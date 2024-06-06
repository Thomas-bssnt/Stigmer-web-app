const webSequence = require("../models/websequence");
const gamesCollection = require("../models/games");
const gameCollection = require("../models/game");
const user = require("../models/user");
const topScore = require("../models/topscore");
const mCollection = require("../models/maps");
const bCollection = require("../models/bots");
const rCollection = require("../models/rules");
const totalScoreSession = require("../models/totalscoresession");

webSequence
  .drop()
  .then(() => {
    console.log("La collection webSequence a bien été effacée");
  })
  .catch((error) => {
    console.log(error.message);
  });

gamesCollection
  .drop()
  .then(() => {
    console.log("La collection webSequence a bien été effacée");
  })
  .catch((error) => {
    console.log(error.message);
  });

totalScoreSession
  .drop()
  .then(() => {
    console.log("La collection totalScoreSession a bien été effacée");
  })
  .catch((error) => {
    console.log(error.message);
  });

gameCollection
  .drop()
  .then(() => {
    console.log("La collection gamecollection a bien été effacée");
  })
  .catch((error) => {
    console.log(error.message);
  });

user
  .drop()
  .then(() => {
    console.log("La collection usercollection a bien été effacée");
  })
  .catch((error) => {
    console.log(error.message);
  });

topScore
  .drop()
  .then(() => {
    console.log("La collection websequence a bien été effacée");
  })
  .catch((error) => {
    console.log(error.message);
  });

mCollection
  .drop()
  .then(() => {
    console.log("La collection topscore a bien été effacée");
  })
  .catch((error) => {
    console.log(error.message);
  });

bCollection
  .drop()
  .then(() => {
    console.log("La collection botcollection a bien été effacée");
  })
  .catch((error) => {
    console.log(error.message);
  });

rCollection
  .drop()
  .then(() => {
    console.log("La collection rulecollection a bien été effacée");
  })
  .catch((error) => {
    console.log(error.message);
  });
