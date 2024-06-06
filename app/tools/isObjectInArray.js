module.exports.isObjectInArray = function (array, x, y) {
  let bool = false;
  for (let element of array) {
    if (element.x == x && element.y == y) {
      bool = true;
      break;
    }
  }
  return bool;
};
