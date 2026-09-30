const { default: axios } = require("axios");
const Order = require("../../../models/orderModel");
const User = require("../../../models/userModel");

const toKhaltiPaisa = (amount, orderAmount) => {
  const suppliedAmount = Number(amount);
  const expectedPaisa = Math.round(Number(orderAmount) * 100);
  if (!Number.isFinite(suppliedAmount) || !Number.isFinite(expectedPaisa))
    return null;

  if (Math.round(suppliedAmount) === expectedPaisa)
    return Math.round(suppliedAmount);
  if (Math.round(suppliedAmount * 100) === expectedPaisa) {
    return Math.round(suppliedAmount * 100);
  }
  return null;
};

exports.initateKhaltiPayment = async (req, res) => {
  const { orderId, amount } = req.body;
  if (!orderId || !amount) {
    return res
      .status(400)
      .json({ message: "Order id and amount are required." });
  }

  let order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }
  const amountInPaisa = toKhaltiPaisa(amount, order.totalAmount);
  if (amountInPaisa === null) {
    return res.status(400).json({ message: "Invalid amount." });
  }

  const khaltiKey =
    process.env.KHALTI_SECRET_KEY || "370da36237d94394a497c6d83e634229";
  const frontendUrl = (
    process.env.FRONTEND_URL || "http://localhost:5173"
  ).replace(/\/$/, "");
  const backendUrl = (
    process.env.BACKEND_URL || "http://localhost:3000/"
  ).replace(/\/$/, "/");
  const data = {
    return_url: `${frontendUrl}/payment/success`,
    purchase_order_id: String(orderId),
    amount: amountInPaisa,
    website_url: backendUrl,
    purchase_order_name: "order_name_" + orderId,
  };

  const response = await axios.post(
    "https://dev.khalti.com/api/v2/epayment/initiate/",
    data,
    {
      headers: {
        Authorization: `key ${khaltiKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  console.log("response", response.data);

  //ensuring the order is an object before adding value in pidx
  if (!order.paymentDetails) {
    order.paymentDetails = {};
  }

  order.paymentDetails.pidx = response.data.pidx;
  await order.save();
  // this will redirect to the pyayment page with or merchant accout to accept payment and
  //filled with all the credentials also giving transactionID too
  // res.redirect(response.data.payment_url);
  res.status(200).json({
    message: "paymeht has been successful",
    paymentUrl: response.data.payment_url,
  });
};

// verifying transaction id pids
exports.verifyPidx = async (req, res) => {
  try {
    const pidx = req.body.pidx || req.query.pidx;
    const userId = req.user?.id;

    if (!pidx) {
      return res.status(400).json({ message: "Pidx is required." });
    }
    const khaltiKey =
      process.env.KHALTI_SECRET_KEY || "370da36237d94394a497c6d83e634229";
    const response = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/lookup/",
      { pidx: pidx },
      {
        headers: {
          Authorization: `key ${khaltiKey}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log("khalti lookup", response.data);
    const order = await Order.findOne({ "paymentDetails.pidx": pidx });
    if (!order) {
      return res
        .status(404)
        .json({ message: "Order for this payment was not found." });
    }

    const orderUserId = order.user?._id || order.user;
    if (!userId || String(orderUserId) !== String(userId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to verify this payment." });
    }

    const paymentStatus = String(response.data.status || "").toLowerCase();
    if (paymentStatus === "completed") {
      if (!order.paymentDetails) order.paymentDetails = {};
      order.paymentDetails.method = "khalti";
      order.paymentDetails.status = "paid";
      order.orderStatus = "confirmed";
      await order.save();

      const user = await User.findById(userId);
      if (user) {
        user.cart = [];
        await user.save();
      }

      return res.status(200).json({
        message: "Payment verified successfully.",
        paymentStatus: "paid",
        order: {
          id: String(order._id),
          totalAmount: order.totalAmount,
          orderStatus: order.orderStatus,
        },
        data: response.data,
      });
    }

    const failedStatuses = new Set([
      "expired",
      "user canceled",
      "user_cancelled",
      "failed",
    ]);
    const verificationStatus = failedStatuses.has(paymentStatus)
      ? "failed"
      : "pending";
    return res.status(200).json({
      message:
        verificationStatus === "failed"
          ? "Payment was not completed."
          : "Payment is still pending.",
      paymentStatus: verificationStatus,
      order: {
        id: String(order._id),
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
      },
      data: response.data,
    });
  } catch (e) {
    console.error("verifyPidx error", e.response?.data || e.message);
    return res
      .status(500)
      .json({
        message: "Verification failed",
        error: e.response?.data || e.message,
      });
  }
};

exports.toKhaltiPaisa = toKhaltiPaisa;
