const collection = require("../models/rules");
const topScore = require("../models/topscore");
const sanitize = require("mongo-sanitize");

/* GET rule page. */
module.exports.getRules = function (req, res) {
  collection
    .find({})
    .then((rules) => {
      res.render("rules", {
        title: "Stigmer Rules",
        rules: rules,
      });
    })
    .catch((error) => {
      console.log(error.message);
    });
};
/* POST rule page. */
// CRUD for rules values in DB
module.exports.postRules = function (req, res) {
  let rulesButton = sanitize(req.body.rulesButton);
  let ruleNameSelect = sanitize(req.body.ruleNameSelect);
  let maxNumberOfStarsPerRound = parseInt(sanitize(req.body.maxNumberOfStarsPerRound));
  let coefRemainingStars = parseInt(sanitize(req.body.coefRemainingStars));
  let coefValueTimesStars = sanitize(req.body.coefValueTimesStars);
  let coefValue = sanitize(req.body.coefValue);

  switch (rulesButton) {
    //click on create
    case "create":
      collection
        .find({})
        .then((rules) => {
          //Auto increment
          let autoIncrement = 0;
          rules.forEach((element) => {
            let split = element.ruleName.split("_");
            split = parseInt(split[1]);
            if (split >= autoIncrement) {
              autoIncrement = split;
            }
          });
          autoIncrement = autoIncrement + 1;
          ruleName = "rule_" + autoIncrement;
          // Store in DB
          collection
            .insert({
              rule: autoIncrement,
              ruleName: ruleName,
              maxNumberOfStarsPerRound: maxNumberOfStarsPerRound,
              coefRemainingStars: coefRemainingStars,
              coefValueTimesStars: coefValueTimesStars,
              coefValue: coefValue,
            })
            .then(() => {
              topScore.insert({
                rule: autoIncrement,
                ruleName: ruleName,
                scoreArray: [],
              });
            })
            .catch((error) => {
              console.log(error.message);
            });
          res.redirect(req.pageContext + "/rules");
        })
        .catch((error) => {
          console.log(`Problem creating rule: ${error.message}`);
        });
      break;
    //click on update
    case "update":
      collection
        .findOneAndUpdate(
          {
            ruleName: ruleNameSelect,
          },
          {
            $set: {
              maxNumberOfStarsPerRound: maxNumberOfStarsPerRound,
              coefRemainingStars: coefRemainingStars,
              coefValueTimesStars: coefValueTimesStars,
              coefValue: coefValue,
            },
          }
        )
        .catch((error) => {
          console.log(error.message);
        });
      res.redirect(req.pageContext + "/rules");
      break;
    //remove fields in DBconst
    case "delete":
      collection
        .findOneAndDelete(
          {
            ruleName: ruleNameSelect,
          },
          {}
        )
        .then(() => {
          topScore.findOneAndDelete({
            ruleName: ruleNameSelect,
          });
        })
        .catch((error) => {
          console.log(error.message);
        });
      res.redirect(req.pageContext + "/rules");
      break;
  }
};

//XHR refresh the values of fields in rules
module.exports.ruleValue = function (req, res) {
  let ruleName = sanitize(req.body.ruleName);

  collection
    .findOne({
      ruleName: ruleName,
    })
    .then((rules) => {
      res.send(rules);
    })
    .catch((error) => {
      console.log(error.message);
    });
};
