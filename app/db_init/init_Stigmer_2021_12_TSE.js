const rCollection = require("../models/rules");
const mCollection = require("../models/maps");
const gamesCollection = require("../models/games");

rCollection
  .bulkWrite([
    {
      insertOne: {
        rule: 2,
        ruleName: "rule_2",
        maxNumberOfStarsPerRound: 15,
        coefRemainingStars: 0,
        coefValueTimesStars: null,
        coefValue: "on",
      },
    },
  ])
  .then(() => {
    console.log("La collection rulecollection a bien été ajoutée");
  })
  .catch((error) => {
    console.log(error.message);
  });

mCollection
  .bulkWrite([
    {
      insertOne: {
        mapName: "random_1",
        mapType: "random",
        map: [
          [3, 1, 2, 27, 51, 2, 2, 3, 2, 0, 2, 0, 2, 3, 6],
          [2, 2, 1, 8, 2, 1, 0, 12, 1, 2, 3, 2, 1, 1, 1],
          [3, 2, 4, 2, 7, 0, 0, 12, 0, 71, 1, 3, 53, 1, 9],
          [72, 2, 2, 2, 6, 8, 19, 3, 1, 1, 72, 1, 1, 1, 14],
          [1, 1, 7, 0, 43, 7, 1, 0, 4, 2, 1, 1, 53, 3, 0],
          [86, 3, 2, 6, 1, 45, 20, 7, 24, 2, 4, 27, 3, 2, 3],
          [5, 3, 84, 3, 2, 0, 0, 3, 2, 27, 3, 1, 3, 14, 2],
          [3, 4, 13, 1, 3, 2, 1, 1, 24, 6, 53, 3, 3, 2, 19],
          [1, 1, 20, 4, 1, 2, 13, 21, 22, 0, 2, 2, 0, 1, 6],
          [2, 2, 13, 1, 0, 0, 24, 86, 0, 3, 2, 2, 1, 3, 20],
          [0, 1, 46, 85, 0, 2, 43, 3, 1, 1, 1, 1, 6, 5, 2],
          [3, 6, 2, 1, 6, 2, 0, 71, 3, 8, 2, 3, 4, 20, 20],
          [8, 2, 3, 4, 2, 2, 1, 1, 2, 0, 1, 3, 2, 45, 0],
          [2, 4, 44, 2, 1, 1, 3, 4, 2, 7, 4, 2, 3, 44, 3],
          [44, 99, 0, 28, 3, 0, 4, 2, 1, 9, 1, 0, 8, 11, 1],
        ],
      },
    },
  ])
  .then(() => {
    console.log("La collection mapcollection a bien été ajoutée");
  })
  .catch((error) => {
    console.log(error.message);
  });

gamesCollection
  .bulkWrite([
    {
      insertOne: {
        gameContext: "local",
        altGameName: "Normal",
        gameName: "L_R2_MR1_0B_1",
        numberRounds: 20,
        numberCellsOpenedPerRound: 3,
        numberPlayers: 5,
        mapSelect: "random_1",
        rulesSelect: "rule_2",
        botsList: [],
        evaporation: "1000",
        randomMS1: "on",
        randomMS2: null,
      },
    },
    {
      insertOne: {
        gameContext: "local",
        altGameName: "NoMemory",
        gameName: "L_R2_MR1_0B_2",
        numberRounds: 20,
        numberCellsOpenedPerRound: 3,
        numberPlayers: 5,
        mapSelect: "random_1",
        rulesSelect: "rule_2",
        botsList: [],
        evaporation: "1000",
        randomMS1: "on",
        randomMS2: "on",
      },
    },
    {
      insertOne: {
        gameContext: "local",
        altGameName: "Indiv",
        gameName: "L_R2_MR1_0B_3",
        numberRounds: 20,
        numberCellsOpenedPerRound: 3,
        numberPlayers: 1,
        mapSelect: "random_1",
        rulesSelect: "rule_2",
        botsList: [],
        evaporation: "1000",
        randomMS1: "on",
        randomMS2: null,
      },
    },
    {
      insertOne: {
        gameContext: "local",
        altGameName: "Evapo_tau3",
        gameName: "L_R2_MR1_0B_4",
        numberRounds: 20,
        numberCellsOpenedPerRound: 3,
        numberPlayers: 5,
        mapSelect: "random_1",
        rulesSelect: "rule_2",
        botsList: [],
        evaporation: "3",
        randomMS1: "on",
        randomMS2: null,
      },
    },
  ])
  .then(() => {
    console.log("La collection gamescollection a bien été ajoutée");
  })
  .catch((error) => {
    console.log(error.message);
  });
