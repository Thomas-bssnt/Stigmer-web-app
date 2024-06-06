const db = require("./db");
const maps = db.get("mapscollection");

maps.createIndex(
  {
    mapName: 1,
  },
  {
    unique: true,
  }
);

module.exports = maps;
