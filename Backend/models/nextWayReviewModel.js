// alternative to reviewModel.js this now comes to populate the review directly in products
const goose = require('mongoose');

// Define the review schema with database fields as userId, productId, rating, and message
const reviewSchema = new goose.Schema({
    // Use MongoDB references to establish relationships
    userId: {
        type: goose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Login first to review"]
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
const NextWayReview = goose.model('NextWayReview', reviewSchema);

//exporting the reviewSchema to populate them not populate 
// but it is like nesting the placeholder inside the another database
//in our case we are nesting it inside the products databse 

// Export the Review model
module.exports = {
    NextWayReview,
    // this review schema will be inside product model
    reviewSchema
}   