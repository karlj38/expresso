const express = require("express");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);
const menuItemsRouter = express.Router({ mergeParams: true });

menuItemsRouter.get("/", (req, res, next) => {
  db.all(
    `SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`,
    (err, rows) => {
      if (err) {
        next(err);
      } else {
        res.send({ menuItems: rows });
      }
    }
  );
});

const verifyMenuItem = (req, res, next) => {
  const menuItem = req.body.menuItem;
  if (
    menuItem.name &&
    menuItem.description &&
    menuItem.inventory &&
    menuItem.price
  ) {
    req.menuItem = menuItem;
    next();
  } else {
    res.sendStatus(400);
  }
};

menuItemsRouter.post("/", verifyMenuItem, (req, res, next) => {
  const menuItem = req.body.menuItem;
  db.run(
    `INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $desc, $inv, $price, $menu)`,
    {
      $name: menuItem.name,
      $desc: menuItem.description,
      $inv: menuItem.inventory,
      $price: menuItem.price,
      $menu: req.params.menuId,
    },
    function (err) {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM menuItem WHERE id = ${this.lastID}`,
          (err, row) => {
            if (err) {
              next(err);
            } else {
              res.status(201).send({ menuItem: row });
            }
          }
        );
      }
    }
  );
});

menuItemsRouter.param("menuItemId", (req, res, next, menuItemId) => {
  db.get(`SELECT * FROM MenuItem WHERE id = ${menuItemId}`, (err, row) => {
    if (err) {
      next(err);
    } else {
      if (row) {
        // req.menuItem = row;
        next();
      } else {
        res.sendStatus(404);
      }
    }
  });
});

menuItemsRouter.put("/:menuItemId", verifyMenuItem, (req, res, next) => {
  const menuItem = req.body.menuItem;
  db.run(
    `UPDATE MenuItem SET name = $name, description = $desc, inventory = $inv, price = $price, menu_id = $menu WHERE id = $id`,
    {
      $name: menuItem.name,
      $desc: menuItem.description,
      $inv: menuItem.inventory,
      $price: menuItem.price,
      $menu: req.params.menuId,
      $id: req.params.menuItemId,
    },
    (err) => {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`,
          (err, row) => {
            if (err) {
              next(err);
            } else {
              res.send({ menuItem: row });
            }
          }
        );
      }
    }
  );
});

menuItemsRouter.delete("/:menuItemId", (req, res, next) => {
  db.run(`DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err) => {
    if (err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = menuItemsRouter;
