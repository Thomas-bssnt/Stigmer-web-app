const collection = require("../models/maps");
const sanitize = require("mongo-sanitize");

/* GET maps page. */
module.exports.getMaps = function (req, res) {
  collection
    .find({})
    .then((maps) => {
      res.render("maps", {
        title: "Stigmer Maps",
        maps: maps,
      });
    })
    .catch((error) => {
      console.log(error.message);
    });
};
/* Post map page. */
// CRUD for maps values in DB
module.exports.postMaps = function (req, res) {
  let mapsButton = sanitize(req.body.mapsButton);
  let mapName = sanitize(req.body.mapName);
  let mapType = sanitize(req.body.mapType);
  let map = sanitize(req.body.map);
  //regex : remove 00 and " "
  map = map.replace(/(?<!\d|\.)0+(?!\D)(?!$)/g, "");
  map = map.replace(/ /g, "");
  map = JSON.parse(map);
  switch (mapsButton) {
    //click on create
    case "create":
      //Auto Increment
      collection
        .find({
          mapType: mapType,
        })
        .then((maps) => {
          let autoIncrement = 0;

          maps.forEach((element) => {
            let split = element.mapName.split("_");
            split = parseInt(split[1]);
            if (split >= autoIncrement) {
              autoIncrement = split;
            }
          });
          autoIncrement = autoIncrement + 1;
          mapName = mapType + "_" + autoIncrement;

          if (mapType) {
            //Store in DB
            collection
              .insert({
                mapName: mapName,
                mapType: mapType,
                map: map,
              })
              .catch((error) => {
                console.log(error.message);
              });
          }
          res.redirect(req.pageContext + "/maps");
        })
        .catch((error) => {
          console.log(error.message);
        });

      break;
    //click on update
    case "update":
      //update DB
      collection
        .update(
          {
            mapName: mapName,
          },
          {
            $set: {
              mapType: mapType,
              map: map,
            },
          }
        )
        .catch((error) => {
          console.log(error.message);
        });
      res.redirect(req.pageContext + "/maps");
      break;
    //click on delete
    case "delete":
      //remove fields in db
      collection
        .findOneAndDelete({
          mapName: mapName,
        })
        .catch((error) => {
          console.log(error.message);
        });
      res.redirect(req.pageContext + "/maps");
      break;
  }
};

//XHR refresh the values of fields in maps
module.exports.mapValue = function (req, res) {
  let mapName = sanitize(req.body.mapName);
  collection
    .findOne({
      mapName: mapName,
    })
    .then((maps) => {
      res.send(maps);
    })
    .catch((error) => {
      console.log(error.message);
    });
};
