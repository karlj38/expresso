const express = require("express");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);
const port = process.env.TEST_DATABASE || 4000;
const app = express();
const apiRouter = require("./api/api");

app.use(express.static("./"));
app.use("/", apiRouter);

app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

module.exports = app;
