const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.get("/", (req, res) => {
  const directoryPath = path.join(__dirname, "./../api");
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    const filteredFiles = files.filter(file => file !== 'api.js').map(file => path.parse(file).name);
    res.send(filteredFiles);
  });
});

module.exports = router;