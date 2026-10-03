const {
  getUsers,
  getUserCount,
  deleteUser,
} = require("../../controller/admin/users/userController");
const isUserAuthenticated = require("../../middlewares/isAuthenticated");
const restrict = require("../../middlewares/restrict");
const catchAsync = require("../../services/catchAsync");
const rtr = require("express").Router();
rtr
  .route("/users")
  .get(
    catchAsync(isUserAuthenticated),
    catchAsync(restrict("admin", "seller")),
    catchAsync(getUsers),
  );
rtr
  .route("/users/count")
  .get(
    catchAsync(isUserAuthenticated),
    catchAsync(restrict("admin", "seller")),
    catchAsync(getUserCount),
  );
rtr
  .route("/users/:id")
  .delete(
    catchAsync(isUserAuthenticated),
    catchAsync(restrict("admin", "seller")),
    catchAsync(deleteUser),
  );

module.exports = rtr;
