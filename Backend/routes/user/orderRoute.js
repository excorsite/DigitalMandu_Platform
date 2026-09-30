// step 3: including the file where the functionality can be found and models
//if necessary so we can dleegate task to those file 
const { getOrders, createOrder, updateOrders, deleteOrder, cancelOrder } = require("../../controller/user/order/orderController")
const isUserAuthenticated = require("../../middlewares/isAuthenticated")
const catchAsync = require("../../services/catchAsync")


// step 1: including router to be exported
// the roter is a function dont forget it using Router will only incur error that is not there 
//this is nasty thing to forget
const rtr = require("express").Router()

//getting carted items
//step 4: which endpoint what to execute there
rtr.route("/orders")
    .get(isUserAuthenticated, catchAsync(getOrders))
    .post(isUserAuthenticated, catchAsync(createOrder))


//cancelling order
rtr.route("/orders/cancel")
    .patch(isUserAuthenticated, catchAsync(cancelOrder))

//user based updating and deleting of order
rtr.route("/orders/:id")
    .patch(isUserAuthenticated, catchAsync(updateOrders))
    .delete(isUserAuthenticated, catchAsync(deleteOrder))

//user based updating and deleting of order

//strp 2: exportng the router to use by other files
module.exports = rtr


//step 5 and 6: final step is to make a variable of this whole route in the maimn app.js file see there
//next step is to use that route there at the app,js so we can seethere 