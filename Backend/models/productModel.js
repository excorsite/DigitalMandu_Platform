const mongoose = require('mongoose');
// having schema so i can nest an schema inside schema which is nexting the reviews inside products
const { reviewSchema } = require('./nextWayReviewModel');
// const { userSchema } = require('./nextWayUserModel');
// Define the product schema with database fields as phone, name, and email
const productSchema = new mongoose.Schema({
    productName: { type: String, required: [true, "product name is required"] },
    productDescription: { type: String, required: [true, "product description is required"] },
    productStock: { type: Number, required: [true, "product stock is required"] },
    productPrice: { type: Number, required: [true, "product price is required"] },
    productStatus: { type: String, enum: ['draft', 'public'], required: [true, "draft is required"], default: "draft" },
    productImage: { type: String,required: [true, "image is required"], default: "drafthttps://artists.spotify.com/songwriter/3IMp1zKhmOEmva4eNPGZKf" },
    // we may not use the follwoing code if we are not nesting the review on a product and using separate cvollection for reviews 
    // this contsins aray of object which later is going to be populated by .push method while creating a reviwe
    // reviews:[reviewSchema]
},{
    // enabling mongodb to use new data called timespants
    timestamps:true,
});
// create model named product which is in side param assigns it the model we created above
// and assigns it to product variable
const Product = mongoose.model('Product', productSchema);

// Export the product model
module.exports = Product;