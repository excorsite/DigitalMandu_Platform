
const Order = require("../../../models/orderModel");
const User = require("../../../models/userModel");

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;

        const { shippingAddress, items, totalAmount, paymentDetails } = req.body;

        // Check if required fields are provided
        if (!shippingAddress || !items || items.length < 1 || !totalAmount || !paymentDetails) {
            return res.status(400).json({ message: "Please fill all the fields." });
        }
        if (!Array.isArray(items) || items.length === 0 || items.some(i => !i.product)) {
            return res.status(400).json({ message: "Invalid items data. Each item must have a product ID." });
        }

        // Populate the orders collection
        const order = await Order.create({
            user: userId,
            shippingAddress,
            items,
            totalAmount,
            paymentDetails,
        });

        const user = await User.findById(userId)
        user.cart=[]
        await user.save()
        

        return res.status(200).json({
            message: "Order created successfully",
            data: order, // Return the created order data
        });
        window.location.href="/"
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Get orders for the logged-in user
exports.getOrders = async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
        return res.status(400).json({ message: "Please login to view orders" });
    }

    const orders = await Order.find({ user: userId }).populate({
        path: "items.product",
        model: "Product",
        select: "-productStock -reviews",
    });

    return res.status(200).json({
        message: orders.length ? "Orders fetched successfully" : "No orders yet",
        data: orders,
    });
};

// Update an order
exports.updateOrders = async (req, res) => {
    const { id } = req.params;
    const { newShippingAddress, items } = req.body;

    if (!newShippingAddress || items.length === 0) {
        return res.status(400).json({ message: "Please fill all the fields." });
    }

    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
        return res.status(404).json({ message: "Order not found" });
    }

    // Check if the user is authorized to update the order
    if (existingOrder.user.toString() !== req.user.id) {
        return res.status(401).json({ message: "You can't update this order." });
    }

    if (existingOrder.orderStatus === "ontheway") {
        return res.status(400).json({ message: "Order is already on the way" });
    }

    // Update the existing order    
    const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { shippingAddress: newShippingAddress, items: items },
        { new: true }
    );

    return res.status(200).json({
        message: "Order updated successfully",
        data: updatedOrder,
    });
};

// Delete an order
exports.deleteOrder = async (req, res) => {
    const { id } = req.params;

    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
        return res.status(404).json({ message: "Order not found" });
    }

    // Check if the user is atuhorized to ledete ordrr
    if (existingOrder.user.toString() !== req.user.id) {
        return res.status(401).json({ message: "You can't delete this order." });
    }

    if (existingOrder.orderStatus === "ontheway") {
        return res.status(400).json({ message: "Order is already on the way" });
    }

    await Order.findByIdAndDelete(id);

    return res.status(200).json({ message: "Order deleted successfully" });
};

// Cancel an order
exports.cancelOrder = async (req, res) => {
    const { id } = req.body;

    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
        return res.status(404).json({ message: "Order not found" });
    }

    // Check if the user is authorized to change the order status
    if (existingOrder.user.toString() !== req.user.id) {
        return res.status(401).json({ message: "You can't change this order status." });
    }

    if (existingOrder.orderStatus === "cancelled") {
        return res.status(400).json({ message: "Order is already cancelled" });
    }

    if (existingOrder.orderStatus !== "pending") {
        return res.status(400).json({ message: "Order is already on the way" });
    }

    // Update the order status to cacnessed
    existingOrder.orderStatus = "cancelled";
    await existingOrder.save();

    return res.status(200).json({
        message: "Order status changed successfully",
        data: existingOrder,
    });
};
