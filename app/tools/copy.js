// Deep copy of an array or an object
module.exports.deepCopy = function (obj) {
  if (Object.prototype.toString.call(obj) === "[object Array]") {
    var len = obj.length,
      out = new Array(len),
      i = 0;
    for (; i < len; i++) {
      out[i] = arguments.callee(obj[i]);
    }
    return out;
  }
  if (typeof obj === "object") {
    var out = {},
      i;
    for (i in obj) {
      out[i] = arguments.callee(obj[i]);
    }
    return out;
  }
  return obj;
};
