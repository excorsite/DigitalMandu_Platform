const goose = require('mongoose');

// Define the review schema with database fields as userId, productId, rating, and message
const reviewSchema = new goose.Schema({
    // Use MongoDB references to establish relationships
    userId: {
        type: goose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Login first to review"]
    },
    productId: {
        type: goose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "No product found"]
    },
    rating: {
        type: Number,
        required: [true, "You must rate the product on a scale of 1-5"]
    },
    message: {
        type: String,
        required: [true, "You need to share your experience to give a review"]
    }
});

// Create model named Review and assign it the schema we created above
const Review = goose.model('Review', reviewSchema);

// Export the Review model
module.exports = Review;    