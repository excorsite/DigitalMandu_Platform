//legacy code no need of this code but supporitng factor while creating the projuecgt






// const Product = require("../../models/productModel");
// const Review = require("../../models/reviewModel");

// // Create a review
// exports.createReview = async (req, res) => {
//     const userId = req.user.id;
//     const { userRating, userMessage } = req.body;
//     const productId = req.params.id;

//     if (!userRating || !userMessage || !productId) {
//         return res.status(400).json({
//             message: "Please provide rating, message, and productId",
//         });
//     }

//     const productExist = await Product.findById(productId);
//     if (!productExist) {
//         return res.status(404).json({
//             message: "Product with that productId does not exist",
//         });
//     }

//     await Review.create({
//         userId,
//         productId,
//         rating: userRating,
//         message: userMessage,
//     });

//     res.status(200).json({
//         message: "Review added successfully",
//     });
// };

// // Get all reviews for a product
// exports.getProductReview = async (req, res) => {
//     const productId = req.params.id;

//     if (!productId) {
//         return res.status(400).json({
//             message: "Please provide productId",
//         });
//     }

//     const productExist = await Product.findById(productId);
//     if (!productExist) {
//         return res.status(404).json({
//             message: "Product with that id doesn't exist",
//         });
//     }

//     const reviews = await Review.find({ productId }).populate("userId");
//     res.status(200).json({
//         message: "Reviews fetched successfully",
//         data: reviews,
//     });
// };

// // Delete a review
// exports.deleteReview = async (req, res) => {
//     const reviewId = req.params.id;

//     if (!reviewId) {
//         return res.status(400).json({
//             message: "Please provide reviewId",
//         });
//     }

//     const review = await Review.findById(reviewId);
//     if (!review) {
//         return res.status(404).json({
//             message: "Review not found",
//         });
//     }

//     await Review.findByIdAndDelete(reviewId);
//     res.status(200).json({
//         message: "Review deleted successfully",
//     });
// };

// // Add a product review
// exports.addProductReview = async (req, res) => {
//     const productId = req.params.id;
//     const { userRating, userMessage } = req.body;
//     const userId = req.user.id;

//     if (!userRating || !userMessage || !productId) {
//         return res.status(400).json({
//             message: "Please provide rating, message, and productId",
//         });
//     }

//     const product = await Product.findById(productId);
//     if (!product) {
//         return res.status(404).json({
//             message: "Product with that id does not exist",
//         });
//     }

//     const review = {
//         userId,
//         rating: userRating,
//         message: userMessage,
//     };

//     product.reviews.push(review);
//     await product.save();

//     res.status(200).json({
//         message: "Review added successfully",
//     });
// };
