const sanitize = require("mongo-sanitize");
const topScoreCollection = require("../models/topscore");

/* Refresh top score */
module.exports.refresh = function (req, res) {
  let leaderBoard = sanitize(JSON.parse(req.body.leaderBoard));
  let gameContext = sanitize(req.body.gameContext);
  let rule = sanitize(parseInt(req.body.rule));
  let scoreUpdated = [];
  leaderBoard.forEach((element) => {
    scoreUpdated.push(element.score);
  });
  if (gameContext === "web") {
    topScoreCollection
      .update(
        { rule: rule },
        {
          $addToSet: {
            scoreArray: {
              $each: scoreUpdated,
            },
          },
        }
      )
      .then(() => {
        topScoreCollection
          .findOneAndUpdate(
            { rule: rule },
            {
              $push: {
                scoreArray: {
                  $each: [],
                  $sort: -1,
                  $slice: 10,
                },
              },
            }
          )
          .then((updatedDoc) => {
            res.json({
              scoreUpdated: updatedDoc.scoreArray,
            });
          })
          .catch((error) => {
            console.log(error.message);
          });
      })
      .catch((error) => {
        console.log(error.message);
      });
  }
};
