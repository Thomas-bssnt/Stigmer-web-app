const zipper = require("zip-local");
const path = require("path");
const fs = require("fs-extra");

/* Create an archive */
module.exports.archive = function () {
  return new Promise((resolve, reject) => {
    let date = Date.now();
    let dir = "../archives";
    let directory = path.normalize(dir);
    let fileName = path.normalize(`${dir}/${date}.zip`);
    //Check or create archive directory
    fs.ensureDir(path.join(__dirname, directory))
      .then(() => {
        let sourceDir = "../data";
        let sourceDirectory = path.normalize(sourceDir);
        // zipping a file
        zipper.zip(path.join(__dirname, sourceDirectory), function (error, zipped) {
          if (!error) {
            zipped.compress(); // compress before exporting
            //save the zipped file to disk
            zipped.save(path.join(__dirname, fileName), function (error) {
              if (!error) {
                resolve(date);
              }
            });
          } else {
            reject(error);
          }
        });
      })
      .catch((er) => {
        console.log(er);
      });
  });
};
