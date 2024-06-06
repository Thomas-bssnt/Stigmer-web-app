/* GET web page. (FR) */
module.exports.getWeb_fr = function (req, res) {
  let env = req.app.get("env");
  res.render("web_fr", {
    title: "Stigmer",
    env: env,
  });
};
