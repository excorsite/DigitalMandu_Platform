const assert = require("node:assert/strict");
const test = require("node:test");
const Order = require("../models/orderModel");
const {
  buildProductSimilarityMap,
  buildPopularityMap,
  buildUserItemMatrix,
  generateRecommendationCandidates,
  isSuccessfulPurchase,
} = require("../services/recommendationService");

const orders = [
  {
    user: "user-a",
    orderStatus: "delivered",
    paymentDetails: { status: "unpaid" },
    items: [{ product: "pizza" }, { product: "momo" }],
  },
  {
    user: "user-b",
    orderStatus: "confirmed",
    paymentDetails: { status: "paid" },
    items: [{ product: "pizza" }, { product: "burger" }],
  },
  {
    user: "user-c",
    orderStatus: "cancelled",
    paymentDetails: { status: "paid" },
    items: [{ product: "momo" }, { product: "burger" }],
  },
];

test("only paid or delivered, non-cancelled orders count", () => {
  assert.equal(isSuccessfulPurchase(orders[0]), true);
  assert.equal(isSuccessfulPurchase(orders[1]), true);
  assert.equal(isSuccessfulPurchase(orders[2]), false);
  assert.equal(
    isSuccessfulPurchase({
      orderStatus: "pending",
      paymentDetails: { status: "pending" },
    }),
    false,
  );
});

test("order schema accepts the confirmed state set by Khalti verification", () => {
  assert.ok(Order.schema.path("orderStatus").enumValues.includes("confirmed"));
});

test("builds binary user-item interactions and co-buyer cosine similarity", () => {
  const matrix = buildUserItemMatrix(orders);
  assert.deepEqual([...matrix.get("user-a")].sort(), ["momo", "pizza"]);

  const similarities = buildProductSimilarityMap(orders);
  assert.equal(similarities.get("pizza").get("momo"), 1 / Math.sqrt(2));
  assert.equal(similarities.get("pizza").get("burger"), 1 / Math.sqrt(2));
  assert.equal(similarities.get("momo").has("burger"), false);
});

test("recommends related unpurchased products and excludes canceled-order signals", () => {
  const candidates = generateRecommendationCandidates({
    userId: "user-a",
    userPurchasedProducts: ["pizza", "momo"],
    similarityMap: buildProductSimilarityMap(orders),
    popularityMap: buildPopularityMap(orders),
  });

  assert.deepEqual(
    candidates.map((candidate) => candidate.productId),
    ["burger"],
  );
  assert.equal(candidates[0].source, "personalized");
});

test("uses popularity for a new user and bounds the result count", () => {
  const candidates = generateRecommendationCandidates({
    userPurchasedProducts: [],
    popularityMap: new Map([
      ["pizza", 4],
      ["momo", 2],
    ]),
    similarityMap: new Map(),
    limit: 99,
  });

  assert.deepEqual(
    candidates.map((candidate) => candidate.productId),
    ["pizza", "momo"],
  );
  assert.ok(candidates.every((candidate) => candidate.source === "popular"));
});
