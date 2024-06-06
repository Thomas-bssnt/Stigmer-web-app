const { isObjectInArray } = require("../tools/isObjectInArray");

/**
 * get the coordinates of the cell to play from colored table if it exists
 * visit strategy
 * @param {array} data
 * @param {object} colorGame
 * @param {array} colorGame.data
 * @param {boolean} colorGame.allElmtsZero
 * @param {array} clickedCells
 * @param {array} bestCellsArray
 * @param {object} params
 * @param {array} params.exploration
 * @returns {clickedCell}
 */

module.exports.getClickedCellBot = function (data, colorGame, clickedCells, bestCellsArray, params) {
  //construct the best cell array with only the coordonates of cells
  let bestCellsArrayXY = [];
  for (let element of bestCellsArray) {
    bestCellsArrayXY.push(element.clickedCell);
  }
  //concatenation of best cells array and already clicked cells
  let forbiddenCells = bestCellsArrayXY.concat(clickedCells);
  //remove duplicated objects
  let forbiddenCellsWithoutDuplicate = [...new Map(forbiddenCells.map((obj) => [JSON.stringify(obj), obj])).values()];
  let rowLength = data[0].length;
  let colLength = data.length;
  let clickedCell = {};
  let cellFound = false;
  let sum = 0;
  let choosingProbabilitySum = 0;
  let choosingProbabilityArray = [];
  let numberOfCells = rowLength * colLength;
  let epsilon = params.exploration[0];
  let beta = params.exploration[1];

  //construct a visit probability array from the colored table
  for (let i = 0; i < colLength; i++) {
    choosingProbabilityArray[i] = [];
    for (let j = 0; j < rowLength; j++) {
      let value = colorGame && !colorGame.allElmtsZero ? colorGame.data[i][j] : 1 / numberOfCells;
      choosingProbabilityArray[i][j] = Math.pow(value, beta);
      sum += choosingProbabilityArray[i][j];
    }
  }

  let tot = 0;
  //sum of the probabilities of the forbidden cells
  forbiddenCellsWithoutDuplicate.forEach((element) => {
    tot += epsilon / numberOfCells + (1 - epsilon) * (choosingProbabilityArray[element.y][element.x] / sum);
  });
  //random value
  let rand = Math.random();
  //converted random in the range of remaining values
  rand *= 1 - tot;
  for (let i = 0; i < colLength; i++) {
    for (let j = 0; j < rowLength; j++) {
      //Normalization
      let choosingProbability = epsilon / numberOfCells + (1 - epsilon) * (choosingProbabilityArray[i][j] / sum);
      if (!isObjectInArray(forbiddenCellsWithoutDuplicate, j, i)) {
        choosingProbabilitySum += choosingProbability;
      }
      //let's choose that cell !
      if (choosingProbabilitySum > rand) {
        clickedCell.y = i;
        clickedCell.x = j;
        cellFound = true;
        break;
      }
    }
    if (cellFound) {
      break;
    }
  }

  return clickedCell;
};
