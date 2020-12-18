const express = require("express");
const sqlite3 = require("sqlite3");
const morgan = require("morgan");
const cors = require("cors");
const errorhandler = require("errorhandler");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);
const port = process.env.PORT || 4000;
const app = express();
const apiRouter = require("./api/api");

app.use(express.static("./"));
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use("/api", apiRouter);

app.use(errorhandler());

app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

module.exports = app;
