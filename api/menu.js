const express = require("express");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);
const menuRouter = express.Router();

menuRouter.get("/", (req, res, next) => {
  db.all("SELECT * FROM Menu", (err, rows) => {
    if (err) {
      next(err);
    } else {
      res.send({ menus: rows });
    }
  });
});

const verifyMenu = (req, res, next) => {
  const menu = req.body.menu;
  if (menu.title) {
    req.menu = menu;
    next();
  } else {
    res.sendStatus(400);
  }
};

menuRouter.post("/", verifyMenu, (req, res, next) => {
  db.run(
    `INSERT INTO Menu (title) VALUES ($title)`,
    { $title: req.menu.title },
    function (err) {
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, row) => {
          if (err) {
            next(err);
          } else {
            res.status(201).send({ menu: row });
          }
        });
      }
    }
  );
});

menuRouter.param("menuId", (req, res, next, menuId) => {
  db.get(`SELECT * FROM Menu WHERE id = ${menuId}`, (err, row) => {
    if (err) {
      next(err);
    } else {
      if (row) {
        req.menu = row;
        next();
      } else {
        res.sendStatus(404);
      }
    }
  });
});

menuRouter.get("/:menuId", (req, res, next) => {
  res.send({ menu: req.menu });
});

menuRouter.put("/:menuId", verifyMenu, (req, res, next) => {
  const menu = req.body.menu;
  db.run(
    `UPDATE Menu SET title = $title WHERE id = $menuId`,
    { $title: menu.title, $menuId: req.params.menuId },
    (err) => {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM Menu WHERE id = ${req.params.menuId}`,
          (err, row) => {
            if (err) {
              next(err);
            } else {
              res.status(200).send({ menu: row });
            }
          }
        );
      }
    }
  );
});

menuRouter.delete("/:menuId", (req, res, next) => {
  db.get(
    `SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`,
    (err, row) => {
      if (err) {
        next(err);
      } else {
        if (row) {
          res.sendStatus(400);
        } else {
          db.run(`DELETE FROM Menu WHERE id = ${req.params.menuId}`, (err) => {
            if (err) {
              next(err);
            } else {
              res.sendStatus(204);
            }
          });
        }
      }
    }
  );
});

const menuItemsRouter = require("./menuItems");

menuRouter.use("/:menuId/menu-items", menuItemsRouter);

module.exports = menuRouter;
