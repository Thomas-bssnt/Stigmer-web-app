const _ = require("underscore");
//shuffle an array of number
module.exports.shuffleArray = function (arrayFromDB) {
  let arrayToShuffle = [];
  let shuffledArrayOneDim = [];
  let shuffledArray = [];
  //Create a one dim array
  arrayFromDB.forEach((element) => {
    arrayToShuffle.push(...element);
  });
  //shuffle array with Fisher–Yates algorithm
  shuffledArrayOneDim = _.shuffle(arrayToShuffle);
  //Recreate a two dim array
  for (let i = 0; i < arrayFromDB.length; i++) {
    shuffledArray[i] = [];
    for (let j = 0; j < arrayFromDB[i].length; j++) {
      let index = i * arrayFromDB.length + j;

      shuffledArray[i].push(shuffledArrayOneDim[index]);
    }
  }

  return shuffledArray;
};

//shuffle an array of object
module.exports.shuffleArrayXY = function (array) {
  let arrayToShuffle = [];
  let shuffledArrayOneDim = [];
  let shuffledArray = [];
  let cell = {};

  let rowLength = array[0].length;
  let colLength = array.length;
  //Create an array of objects
  for (let i = 0; i < colLength; i++) {
    for (let j = 0; j < rowLength; j++) {
      cell = {};
      cell.x = j;
      cell.y = i;
      array[i][j] = cell;
    }
  }
  //Create a one dim array
  array.forEach((element) => {
    arrayToShuffle.push(...element);
  });
  //shuffle array with Fisher–Yates algorithm
  shuffledArrayOneDim = _.shuffle(arrayToShuffle);
  //Recreate a two dim array
  for (let i = 0; i < colLength; i++) {
    shuffledArray[i] = [];
    for (let j = 0; j < rowLength; j++) {
      let index = i * colLength + j;
      shuffledArray[i].push(shuffledArrayOneDim[index]);
    }
  }
  return shuffledArray;
};

//reorganize an array from a reference array
module.exports.rearrangeArray = function (oldArray, refArray) {
  let newArray = [];

  let rowLength = oldArray[0].length;
  let colLength = oldArray.length;

  for (let i = 0; i < colLength; i++) {
    newArray[i] = [];
    for (let j = 0; j < rowLength; j++) {
      newArray[i][j] = oldArray[refArray[i][j].y][refArray[i][j].x];
    }
  }

  return newArray;
};
