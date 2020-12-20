const express = require("express");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);
const employeeRouter = express.Router();
const timesheetRouter = require("./timesheet");

const verifyEmployee = (req, res, next) => {
  const employee = req.body.employee;
  if (employee.name && employee.position && employee.wage) {
    next();
  } else {
    res.sendStatus(400);
  }
};

employeeRouter.get("/", (req, res, next) => {
  db.all(
    "SELECT * FROM Employee WHERE is_current_employee = 1",
    (err, rows) => {
      if (err) {
        next(err);
      }
      res.send({ employees: rows });
    }
  );
});

employeeRouter.post("/", verifyEmployee, (req, res, next) => {
  const employee = req.body.employee;
  db.run(
    "INSERT INTO Employee (name, position, wage) VALUES ($name, $position, $wage)",
    {
      $name: employee.name,
      $position: employee.position,
      $wage: employee.wage,
    },
    function (err) {
      if (err) {
        next(err);
      }
      db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, row) => {
        if (err) {
          next(err);
        }
        res.status(201).send({ employee: row });
      });
    }
  );
});

employeeRouter.param("employeeId", (req, res, next, employeeId) => {
  db.get(`SELECT * FROM Employee WHERE id = ${employeeId}`, (err, row) => {
    if (err) {
      next(err);
    } else {
      if (row) {
        req.employee = row;
        next();
      } else {
        res.sendStatus(404);
      }
    }
  });
});

employeeRouter.get("/:employeeId", (req, res, next) => {
  res.send({ employee: req.employee });
});

employeeRouter.put("/:employeeId", verifyEmployee, (req, res, next) => {
  const employee = req.body.employee;
  db.run(
    `UPDATE Employee SET name = $name, position = $position, wage = $wage WHERE id = ${req.params.employeeId}`,
    {
      $name: employee.name,
      $position: employee.position,
      $wage: employee.wage,
    },
    (err) => {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM Employee WHERE id = ${req.params.employeeId}`,
          (err, row) => {
            if (err) {
              next(err);
            } else {
              res.send({ employee: row });
            }
          }
        );
      }
    }
  );
});

employeeRouter.delete("/:employeeId", (req, res, next) => {
  db.run(
    `UPDATE Employee SET is_current_employee = 0 WHERE id = ${req.params.employeeId}`,
    function (err) {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM Employee WHERE id = ${req.params.employeeId}`,
          (err, row) => {
            if (err) {
              next(err);
            }
            res.status(200).send({ employee: row });
          }
        );
      }
    }
  );
});

employeeRouter.use("/:employeeId/timesheets", timesheetRouter);

module.exports = employeeRouter;
