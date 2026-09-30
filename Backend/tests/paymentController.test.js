const assert = require("node:assert/strict");
const test = require("node:test");
const {
  toKhaltiPaisa,
} = require("../controller/user/payment/paymentController");

test("converts rupee amounts above Rs 1,000 to paisa", () => {
  assert.equal(toKhaltiPaisa(1500, 1500), 150000);
});

test("accepts an already converted paisa amount", () => {
  assert.equal(toKhaltiPaisa(150000, 1500), 150000);
});

test("rejects an amount that does not match the order total", () => {
  assert.equal(toKhaltiPaisa(1499, 1500), null);
});
