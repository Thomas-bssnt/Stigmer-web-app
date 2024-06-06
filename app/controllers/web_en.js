/* GET web page. (EN) */
module.exports.getWeb_en = function (req, res) {
  let env = req.app.get("env");
  res.render("web", {
    title: "Stigmer Game",
    env: env,
  });
};
