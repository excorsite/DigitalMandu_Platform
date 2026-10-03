const assert = require("node:assert/strict");
const test = require("node:test");
const User = require("../models/userModel");
const {
  getUsers,
  deleteUser,
} = require("../controller/admin/users/userController");

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

test("seller user list is limited to customer accounts", async () => {
  const originalFind = User.find;
  let query;
  User.find = (filter) => {
    query = filter;
    return { select: async () => [] };
  };

  try {
    const response = createResponse();
    await getUsers({ user: { id: "seller-1", role: "seller" } }, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(query, { _id: { $ne: "seller-1" }, role: "customer" });
    assert.deepEqual(response.body.userData, []);
  } finally {
    User.find = originalFind;
  }
});

test("seller cannot delete another seller account", async () => {
  const originalFindById = User.findById;
  const originalFindByIdAndDelete = User.findByIdAndDelete;
  let deleteCalled = false;
  User.findById = async () => ({ _id: "seller-2", role: "seller" });
  User.findByIdAndDelete = async () => {
    deleteCalled = true;
  };

  try {
    const response = createResponse();
    await deleteUser(
      { params: { id: "seller-2" }, user: { id: "seller-1", role: "seller" } },
      response,
    );

    assert.equal(response.statusCode, 403);
    assert.equal(deleteCalled, false);
  } finally {
    User.findById = originalFindById;
    User.findByIdAndDelete = originalFindByIdAndDelete;
  }
});
