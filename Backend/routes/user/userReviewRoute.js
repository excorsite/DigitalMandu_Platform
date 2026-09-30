const { getReviewsByAUser, getProductReview, getReviewsByProductAndUser, createReview, deleteReview, addProductReview } = require('../../controller/user/review/reviewController');
// const { createReview, getProductReview, deleteReview, addProductReview } = require('../controller/user/userController');
const isUserAuthenticated = require('../../middlewares/isAuthenticated');
const restrict = require('../../middlewares/restrict');
const catchAsync = require('../../services/catchAsync');

//using express router
const rtr = require('express').Router();
//authenticatio routes 
// htting post request on the /register endpoint with the logics

// rtr.route('/reviews/:id')
//     .get(catchAsync(getProductReview))
//     .delete(isUserAuthenticated, catchAsync(deleteReview))
//     .post(isUserAuthenticated, catchAsync(createReview));

//for all the review user has done
rtr.route("/reviews", isUserAuthenticated, catchAsync(getReviewsByAUser))

//for all review related to specific product id 
rtr.route('/reviews/:id')
    .get(catchAsync(getProductReview))
    //letting only user to create and delete review
    .delete(isUserAuthenticated,restrict("customer"), catchAsync(deleteReview))
    .post(isUserAuthenticated,restrict("customer"), catchAsync(addProductReview));

    //use following if using method 2
    // .post(isUserAuthenticated, catchAsync(addProductReview));


module.exports = rtr;
