const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.get("/", (req, res) => {
  const directoryPath = path.join(__dirname, "./../track");
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    const filteredFiles = files.filter(file => file !== 'track.js').map((file) => "/" + path.parse(file).name);
    res.send(filteredFiles);
  });
});

module.exports = router;