const assert = require("node:assert/strict");
const test = require("node:test");
const User = require("../models/userModel");
const { registerUser } = require("../controller/auth/authController");

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

test("registration rejects non-Gmail email addresses", async () => {
  const originalFindOne = User.findOne;
  User.findOne = async () => {
    throw new Error("Database should not be queried for invalid input");
  };

  try {
    const response = createResponse();
    await registerUser(
      {
        body: {
          userEmail: "person@example.com",
          userName: "Person",
          userPhone: "1234567890",
          userPassword: "password",
        },
      },
      response,
    );

    assert.equal(response.statusCode, 400);
    assert.match(response.body.message, /Gmail/i);
  } finally {
    User.findOne = originalFindOne;
  }
});

test("registration rejects phone numbers containing non-digits", async () => {
  const originalFindOne = User.findOne;
  User.findOne = async () => {
    throw new Error("Database should not be queried for invalid input");
  };

  try {
    const response = createResponse();
    await registerUser(
      {
        body: {
          userEmail: "person@gmail.com",
          userName: "Person",
          userPhone: "12345abc90",
          userPassword: "password",
        },
      },
      response,
    );

    assert.equal(response.statusCode, 400);
    assert.match(response.body.message, /10 digits/i);
  } finally {
    User.findOne = originalFindOne;
  }
});
