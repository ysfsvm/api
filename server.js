const https = require("https");
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 8080;

app.get("/", (req, res) => {
  const directoryPath = path.join(__dirname, "/");
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      return res.status(500).send({ error: "Unable to scan directory." });
    }
    const filteredFiles = files
      .filter((file) => {
        const filePath = path.join(directoryPath, file);
        return (
          fs.statSync(filePath).isDirectory() &&
          file !== "node_modules" &&
          file !== ".config" &&
          file !== ".data" &&
          file !== ".git" &&
          file !== ".node-gyp"
        );
      })
      .map((file) => "/" + path.parse(file).name);
    res.status(200).send({ path: filteredFiles });
  });
});

app.get("/healthcheck", (req, res) => {
  res.send("ok");
});

const trackRoutes = require("./track/track");
const pttRoutes = require("./track/ptt");
const yurticiRoutes = require("./track/yurtici");
const hepsijetRoutes = require("./track/hepsijet");

const apiRoutes = require("./api/api");

app.use("/track", trackRoutes);
app.use("/track/ptt", pttRoutes);
app.use("/track/yurtici", yurticiRoutes);
app.use("/track/hepsijet", hepsijetRoutes);

app.use("/api", apiRoutes);

app.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
