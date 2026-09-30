const assert = require("node:assert/strict");
const test = require("node:test");
const Order = require("../models/orderModel");
const {
  getAllOrders,
  updateOrderStatus,
} = require("../controller/admin/order/adminOrderController");

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test("seller approval accepts the confirmed status from newOrderStatus", async () => {
  const originalFindByIdAndUpdate = Order.findByIdAndUpdate;
  let update;
  Order.findByIdAndUpdate = async (_id, changes) => {
    update = changes;
    return { _id: "order-1", ...changes };
  };

  try {
    const response = createResponse();
    await updateOrderStatus(
      { params: { id: "order-1" }, body: { newOrderStatus: "confirmed" } },
      response,
    );

    assert.equal(response.statusCode, 200);
    assert.deepEqual(update, { orderStatus: "confirmed" });
    assert.equal(response.body.data.orderStatus, "confirmed");
  } finally {
    Order.findByIdAndUpdate = originalFindByIdAndUpdate;
  }
});

test("seller status update rejects the unsupported shipped value", async () => {
  const response = createResponse();
  await updateOrderStatus(
    { params: { id: "order-1" }, body: { newOrderStatus: "shipped" } },
    response,
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, "invalid status");
});

test("seller dashboard receives an empty order list when there are no orders", async () => {
  const originalFind = Order.find;
  Order.find = () => ({ populate: async () => [] });

  try {
    const response = createResponse();
    await getAllOrders({}, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body.data, []);
  } finally {
    Order.find = originalFind;
  }
});
