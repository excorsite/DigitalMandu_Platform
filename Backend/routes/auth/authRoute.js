const { registerUser, loginUser, forgotPassword, verifyOTP, resetPassword } = require('../../controller/auth/authController');
const catchAsync = require('../../services/catchAsync');

//using express router
const rtr = require('express').Router();
//authenticatio routes 
// htting post request on the /register endpoint with the logics
rtr.route('/register').post(catchAsync(registerUser))
rtr.route('/login').post(catchAsync(loginUser))
rtr.route('/forgot').post(catchAsync(forgotPassword))
rtr.route('/verify_otp').post(catchAsync(verifyOTP))
rtr.route('/reset_password').post(catchAsync(resetPassword))


module.exports = rtr;
