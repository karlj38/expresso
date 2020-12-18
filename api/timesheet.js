const express = require("express");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);
const timesheetRouter = express.Router({ mergeParams: true });

timesheetRouter.get("/", (req, res, next) => {
  db.all(
    `SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`,
    (err, rows) => {
      if (err) {
        next(err);
      } else {
        res.status(200).send({ timesheets: rows });
      }
    }
  );
});

const verifyTimesheet = (req, res, next) => {
  const timesheet = req.body.timesheet;
  if (timesheet.hours && timesheet.rate && timesheet.date) {
    next();
  } else {
    res.sendStatus(400);
  }
};

timesheetRouter.post("/", verifyTimesheet, (req, res, next) => {
  const timesheet = req.body.timesheet;
  db.run(
    "INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employee_id)",
    {
      $hours: timesheet.hours,
      $rate: timesheet.rate,
      $date: timesheet.date,
      $employee_id: req.params.employeeId,
    },
    function (err) {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM Timesheet WHERE id = ${this.lastID}`,
          (err, row) => {
            if (err) {
              next(err);
            } else {
              res.status(201).send({ timesheet: row });
            }
          }
        );
      }
    }
  );
});

timesheetRouter.param("timesheetId", (req, res, next, timesheetId) => {
  db.get(`SELECT * FROM Timesheet WHERE id = ${timesheetId}`, (err, row) => {
    if (err) {
      next(err);
    } else if (row) {
      //   req.timesheet = row;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

timesheetRouter.put("/:timesheetId", verifyTimesheet, (req, res, next) => {
  const timesheet = req.body.timesheet;
  db.run(
    `UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employee WHERE id = ${req.params.timesheetId}`,
    {
      $hours: timesheet.hours,
      $rate: timesheet.rate,
      $date: timesheet.date,
      $employee: req.params.employeeId,
    },
    (err) => {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`,
          (err, row) => {
            if (err) {
              next(err);
            } else {
              res.send({ timesheet: row });
            }
          }
        );
      }
    }
  );
});

timesheetRouter.delete("/:timesheetId", (req, res, next) => {
  db.run(
    `DELETE FROM Timesheet WHERE id = ${req.params.timesheetId}`,
    (err) => {
      if (err) {
        next(err);
      } else {
        res.sendStatus(204);
      }
    }
  );
});

module.exports = timesheetRouter;
