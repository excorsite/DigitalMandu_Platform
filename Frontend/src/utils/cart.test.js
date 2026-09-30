import assert from "node:assert/strict";
import test from "node:test";
import {
  calcSubtotal,
  getCartName,
  getCartPrice,
  getCartProductId,
} from "./cart.js";

test("reads product details from a populated cart product array", () => {
  const item = {
    product: [{ _id: "product-1", productName: "Momo", productPrice: 125 }],
    quantity: 2,
  };

  assert.equal(getCartName(item), "Momo");
  assert.equal(getCartPrice(item), 125);
  assert.equal(getCartProductId(item), "product-1");
  assert.equal(calcSubtotal([item]), 250);
});

test("supports direct product objects and string product IDs", () => {
  const populatedItem = {
    product: { _id: "product-2", productName: "Tea", productPrice: 40 },
    quantity: 1,
  };
  const unpopulatedItem = {
    product: "product-3",
    productPrice: 60,
    quantity: 3,
  };

  assert.equal(getCartProductId(populatedItem), "product-2");
  assert.equal(getCartPrice(populatedItem), 40);
  assert.equal(getCartProductId(unpopulatedItem), "product-3");
  assert.equal(calcSubtotal([unpopulatedItem]), 180);
});
