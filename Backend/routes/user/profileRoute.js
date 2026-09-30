const { getMyProfile, deleteProfile, updatePassword, updateProfile } = require('../../controller/user/customization/customizationController');
const isUserAuthenticated = require('../../middlewares/isAuthenticated');
const catchAsync = require('../../services/catchAsync');

//using express router
const rtr = require('express').Router();

rtr.route("/:id").get(isUserAuthenticated,catchAsync(getMyProfile))
.delete(isUserAuthenticated,catchAsync(deleteProfile))
.patch(isUserAuthenticated,catchAsync(updateProfile))


rtr.route("/changePassword/:id")
.patch(isUserAuthenticated,catchAsync(updatePassword))

module.exports = rtr;
