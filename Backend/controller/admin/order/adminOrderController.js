const Order = require("../../../models/orderModel");

// getting the orders of user
exports.getAllOrders = async (req, res) => {
  const orders = await Order.find().populate({
    path: "items.product",
    model: "Product",
    select: "-productStock -reviews",
  });
  if (orders.length == 0) {
    return res.status(200).json({
      message: "no orders",
      data: orders,
    });
  }
  res.status(200).json({
    message: "orders fetched successfully",
    data: orders,
  });
};

//gegging single order details
exports.getSingleOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id).populate({
    path: "items.product",
    model: "Product",
  });
  if (!order) {
    res.status(404).json({
      message: "order not found",
      data: order,
    });
  }
  res.status(200).json({
    message: "order details fetched successfully",
    data: order,
  });
};

//update order status
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const newOrderStatus = String(
    req.body?.newOrderStatus ?? req.body?.status ?? "",
  )
    .trim()
    .toLowerCase();
  const validStatuses = [
    "pending",
    "confirmed",
    "preparation",
    "ontheway",
    "delivered",
    "cancelled",
  ];

  if (!validStatuses.includes(newOrderStatus)) {
    return res.status(400).json({
      message: "invalid status",
      data: null,
    });
  }

  const order = await Order.findByIdAndUpdate(
    id,
    { orderStatus: newOrderStatus },
    { new: true, runValidators: true },
  );

  if (!order) {
    return res.status(404).json({
      message: "order not found",
      data: null,
    });
  }

  return res.status(200).json({
    message: "order status updated successfully",
    data: order,
  });
};

//delete order
exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findByIdAndDelete(id);
  if (!order) {
    res.status(404).json({
      message: "order not found",
      data: order,
    });
  }
  res.status(200).json({
    message: "order deleted successfully",
    data: order,
  });
};
