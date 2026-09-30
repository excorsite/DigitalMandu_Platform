const { initateKhaltiPayment, verifyPidx } = require("../../controller/user/payment/paymentController")
const isUserAuthenticated = require("../../middlewares/isAuthenticated")
const catchAsync = require("../../services/catchAsync")

const rtr = require("express").Router()

rtr.route("/payment")
    .post(isUserAuthenticated, catchAsync(initateKhaltiPayment))

//
rtr.route("/payment/verifyPidx")
    .post(isUserAuthenticated, catchAsync(verifyPidx))

module.exports = rtr

