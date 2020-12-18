const express = require("express");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

const apiRouter = express.Router();

// apiRouter.get("/", (req, res, next) => {
//   res.send("working");
// });

module.exports = apiRouter;
