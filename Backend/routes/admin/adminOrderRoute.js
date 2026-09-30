
const { getAllOrders, getSingleOrder, updateOrderStatus, deleteOrder } = require("../../controller/admin/order/adminOrderController");
const isUserAuthenticated = require("../../middlewares/isAuthenticated");
const restrict = require("../../middlewares/restrict");
const catchAsync = require("../../services/catchAsync");
const rtr = require("express").Router();
rtr.route("/getOrdersAsAnAdmin")
    .get(catchAsync(isUserAuthenticated), catchAsync(restrict("admin","seller")), catchAsync(getAllOrders))
rtr.route("/ordersAsAnAdmin/:id")
    .get(catchAsync(isUserAuthenticated), catchAsync(restrict("admin","seller")), catchAsync(getSingleOrder))
    .patch(catchAsync(isUserAuthenticated), catchAsync(restrict("admin","seller")), catchAsync(updateOrderStatus))
    .delete(catchAsync(isUserAuthenticated), catchAsync(restrict("admin","seller")), catchAsync(deleteOrder))


module.exports = rtr