const Product = require("../../../models/productModel");
const User = require("../../../models/userModel");

exports.addToCart = async (req, res) => {
    try {
        const userID = req.user.id;
        const { productID } = req.params;

        // Retrieve the product
        const product = await Product.findById(productID);
        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        // Retrieve the user
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Finding specific product in the cart 
        const existingCartItem = user.cart.find((x) => x.product.toString() === productID);
        // If product already exists in cart, increase quantity
        if (existingCartItem) {
            existingCartItem.quantity+=1;
        } else {
            // Else create new instance of the product
            user.cart.push({
                quantity: 1,
                product: productID
            });
        }

        await user.save();
        const updatedUser = await User.findById(userID).populate("cart.product");
        res.status(200).json({ message: "Product added to cart", data: updatedUser.cart });
    } catch (error) {
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Getting my cart items
exports.getCartItems = async (req, res) => {
    try {
        const userID = req.user.id;
        // Get specific user
        const user = await User.findById(userID).populate({
            path: "cart.product",
            select: "-productStatus" // Select all fields except productStatus
        });

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.status(200).json({
            message: "Fetched cart items",
            data: user.cart
        });
    } catch (error) {
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Removing element from cart (accepts productID or cartID subdoc _id)
exports.removeCartItem = async (req, res) => {
    try {
        const userID = req.user.id;
        const productID = req.params.productID || req.params.cartID;
        // Get specific user
        const user = await User.findById(userID);
        
        if (!user) {
            return res.status(200).json({ msg: "User not found, but no error" });
        }
        
        // Match by product ObjectId OR subdoc _id (supports both frontend call styles)
        const cartItemIndex = user.cart.findIndex((x) => x.product.toString() === productID || String(x._id) === productID);
        if (cartItemIndex === -1) {
            return res.status(404).json({ msg: "Product not found in cart" });
        }
        user.cart = user.cart.filter((x) => String(x._id) !== productID && x.product.toString() !== productID);
        await user.save();
        
        res.status(200).json({
            message: "Removed an item from cart"
        });
    } catch (error) {
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: "Unauthorized: User ID is missing" });
        }

        const userID = req.user.id;
        const cartID = req.params.cartID;  // Ensure it's "cartID" (not productID)
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ msg: "Invalid quantity" });
        }

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const cartItem = user.cart.find((item) => String(item._id) === cartID);
        if (!cartItem) {
            return res.status(404).json({ msg: "Product not found in cart" });
        }

        cartItem.quantity = quantity;
        await user.save();

        return res.status(200).json({
            message: "Updated cart item quantity",
            updatedCart: user.cart
        });

    } catch (error) {
        console.error("Error updating cart item:", error.message);
        return res.status(500).json({ msg: "Server error", error: error.message });
    }
};
