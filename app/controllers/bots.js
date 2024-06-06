const collection = require("../models/bots");
const sanitize = require("mongo-sanitize");

/* GET bot page. */
module.exports.getBots = function (req, res) {
  collection.find({}).then((bots) => {
    res.render("bots", {
      title: "Stigmer Bots",
      bots: bots,
    });
  });
};

module.exports.postBots = function (req, res) {
  // Request
  let action = sanitize(req.body.action);
  let typeOfFunction = sanitize(req.body.typeOfFunction);
  let botName = sanitize(req.body.botName);
  let visitStrategy = sanitize(req.body.visitStrategy);
  let exploration = sanitize(req.body.exploration);
  let bettingStrategy = sanitize(req.body.bettingStrategy);
  let oneRoundMemory = sanitize(req.body.oneRoundMemory);

  switch (action) {
    // Click on create
    case "create":
      // Store in DB
      /**
       * @type {bots}
       * @property {string} botName
       * @property {string} typeOfFunction
       * @property {array} visitStrategy
       * @property {array} exploration
       * @property {array} bettingStrategy
       * @property {string} oneRoundMemory
       */
      collection
        .insert({
          botName: botName,
          typeOfFunction: typeOfFunction,
          visitStrategy: visitStrategy,
          exploration: exploration,
          bettingStrategy: bettingStrategy,
          oneRoundMemory: oneRoundMemory,
        })
        .then(() => {
          res.json({
            message: "success",
          });
        })
        .catch((error) => {
          console.log(error.message);
          res.json({
            error: error.message,
          });
          res.status(error.status || 500);
        });

      break;
    // Click on update
    case "update":
      // Update DB
      collection
        .findOneAndUpdate(
          {
            botName: botName,
          },
          {
            $set: {
              botName: botName,
              typeOfFunction: typeOfFunction,
              visitStrategy: visitStrategy,
              exploration: exploration,
              bettingStrategy: bettingStrategy,
              oneRoundMemory: oneRoundMemory,
            },
          }
        )
        .then(() => {
          res.json({
            message: "success",
          });
        })
        .catch((error) => {
          console.log(error.message);
          res.json({
            error: error.message,
          });
          res.status(error.status || 500);
        });

      break;
    // Click on delete
    case "delete":
      collection
        .findOneAndDelete({
          botName: botName,
        })
        .then(() => {
          res.json({
            message: "success",
          });
        })
        .catch((error) => {
          console.log(error.message);
          res.json({
            error: error.message,
          });
          res.status(error.status || 500);
        });

      break;
  }
};

//XHR refresh the values of fields in bots
module.exports.botValue = function (req, res) {
  let botName = sanitize(req.body.botName);
  collection
    .findOne({
      botName: botName,
    })
    .then((bots) => {
      res.send(bots);
    })
    .catch((error) => {
      console.log(error.message);
      res.json({
        message: error.message,
      });
      res.status(error.status || 500);
    });
};
