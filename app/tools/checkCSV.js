const path = require("path");
const fs = require("fs");
let csv = require("csv-parser");
const dir = "../data/test/out/";
//const dir = "D:/Bureau/test2/TEST_R2_2DEF_3COL/out/";
const directory = path.normalize(dir);
fs.promises.readdir(path.join(__dirname, directory)).then((files) => {
  //fs.promises.readdir(directory).then((files) => {
  for (let i = 0; i < files.length; i++) {
    let currFilePath = directory + files[i];
    let csvData = [];
    fs.createReadStream(currFilePath)
      .pipe(csv())
      .on("data", (row) => {
        let round = row.round;
        let playerId = row.playerId;
        let mapX = row.mapX;
        let mapY = row.mapY;
        let value = row.value;
        let numberStars = row.numberStars;
        let score = row.score;

        let gameState = {
          round: round,
          playerId: playerId,
          mapX: mapX,
          mapY: mapY,
          value: value,
          numberStars: numberStars,
          score: score,
        };
        csvData.push(gameState);
      })
      .on("end", () => {
        /*
        let pseudoSet = new Set();
        let roundSet = new Set();

        for (let data of csvData) {
          pseudoSet.add(data.playerId);
          roundSet.add(data.round);
        }
        */
        checkCSVLength(csvData, files[i]);
        checkCSVHitNumber(csvData, files[i]);
        checkCSVDuplicate(csvData, files[i]);
      });
  }
});

function checkCSVLength(csvData, fileName) {
  if (csvData.length !== 300) {
    console.log("Erreur -> le nombre de lignes est incorrect :", fileName);
  }
}

function checkCSVDuplicate(csvData, fileName) {
  for (let i = 0; i < 100; i++) {
    let checkArray = [];
    let j;
    for (j = i * 3; j < i * 3 + 3; j++) {
      if (checkArray.length === 0) {
        checkArray.push(csvData[j]);
      } else {
        try {
          if (!(csvData[j].mapX === checkArray[checkArray.length - 1].mapX && csvData[j].mapY === checkArray[checkArray.length - 1].mapY)) {
            checkArray.push(csvData[j]);
          }
        } catch (error) {
          console.log("Erreur ! (comparaison impossible car le nombre de ligne dans le fichier est incorrect)");
        }
      }
    }
    if (checkArray.length !== 3) {
      console.log("Erreur -> une cellule dupliquée ligne :", i * 3 + (j % 3) + 2, "dans le fichier :", fileName);
    }
  }
}

function checkCSVHitNumber(csvData, fileName) {
  let playerHitNumber = new Map();
  for (let csv of csvData) {
    if (!playerHitNumber.has(csv.playerId)) {
      playerHitNumber.set(csv.playerId, 1);
    } else {
      playerHitNumber.set(csv.playerId, playerHitNumber.get(csv.playerId) + 1);
    }
  }
  let hitNumber = playerHitNumber.get(csvData[0].playerId);
  let flag = false;
  for (let value of playerHitNumber.values()) {
    if (value !== hitNumber) {
      flag = true;
    }
  }
  if (flag) {
    console.log("Erreur -> le nombre de coups pour chaque joueur est incorrect :", fileName);
  }
}
