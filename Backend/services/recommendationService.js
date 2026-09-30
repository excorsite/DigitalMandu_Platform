const Order = require("../models/orderModel");

const normalizeObjectId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value._id) return String(value._id);
  return String(value);
};

const isSuccessfulPurchase = (order) => {
  if (!order || String(order.orderStatus || "").toLowerCase() === "cancelled") {
    return false;
  }

  return (
    String(order.paymentDetails?.status || "").toLowerCase() === "paid" ||
    String(order.orderStatus || "").toLowerCase() === "delivered"
  );
};

const buildUserItemMatrix = (orders) => {
  const userMatrix = new Map();

  for (const order of orders || []) {
    if (!isSuccessfulPurchase(order)) continue;
    const userId = normalizeObjectId(order.user);
    if (!userId) continue;

    const products = userMatrix.get(userId) || new Set();
    for (const item of order.items || []) {
      const productId = normalizeObjectId(item.product);
      if (productId) products.add(productId);
    }
    userMatrix.set(userId, products);
  }

  return userMatrix;
};

const buildProductSimilarityMap = (orders) => {
  const productUsers = new Map();
  for (const [userId, products] of buildUserItemMatrix(orders)) {
    for (const productId of products) {
      const users = productUsers.get(productId) || new Set();
      users.add(userId);
      productUsers.set(productId, users);
    }
  }

  const productIds = [...productUsers.keys()];
  const similarityMap = new Map(
    productIds.map((productId) => [productId, new Map()]),
  );
  for (let leftIndex = 0; leftIndex < productIds.length; leftIndex += 1) {
    const leftId = productIds[leftIndex];
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < productIds.length;
      rightIndex += 1
    ) {
      const rightId = productIds[rightIndex];
      const leftUsers = productUsers.get(leftId);
      const rightUsers = productUsers.get(rightId);
      const [smaller, larger] =
        leftUsers.size <= rightUsers.size
          ? [leftUsers, rightUsers]
          : [rightUsers, leftUsers];
      let sharedBuyers = 0;
      for (const userId of smaller) {
        if (larger.has(userId)) sharedBuyers += 1;
      }

      if (sharedBuyers === 0) continue;
      const similarity =
        sharedBuyers / Math.sqrt(leftUsers.size * rightUsers.size);
      similarityMap.get(leftId).set(rightId, similarity);
      similarityMap.get(rightId).set(leftId, similarity);
    }
  }

  return similarityMap;
};

const buildPopularityMap = (orders) => {
  const popularityMap = new Map();
  for (const order of orders || []) {
    if (!isSuccessfulPurchase(order)) continue;
    const productsInOrder = new Set(
      (order.items || [])
        .map((item) => normalizeObjectId(item.product))
        .filter(Boolean),
    );
    for (const productId of productsInOrder) {
      popularityMap.set(productId, (popularityMap.get(productId) || 0) + 1);
    }
  }
  return popularityMap;
};

const popularCandidates = (popularityMap, purchasedProducts, limit) =>
  Array.from(popularityMap || [])
    .filter(([productId]) => !purchasedProducts.has(productId))
    .sort(
      ([idA, countA], [idB, countB]) =>
        countB - countA || idA.localeCompare(idB),
    )
    .slice(0, limit)
    .map(([productId, score]) => ({ productId, score, source: "popular" }));

const generateRecommendationCandidates = ({
  userId,
  userPurchasedProducts,
  similarityMap,
  popularityMap,
  limit = 8,
}) => {
  const purchasedProducts = new Set(
    Array.from(userPurchasedProducts || [], (productId) => String(productId)),
  );
  const safeLimit = Number.isInteger(Number(limit))
    ? Math.max(1, Math.min(20, Number(limit)))
    : 8;

  if (!purchasedProducts.size) {
    return popularCandidates(popularityMap, purchasedProducts, safeLimit);
  }

  const candidates = [];
  for (const [productId, relatedProducts] of similarityMap || []) {
    if (purchasedProducts.has(productId)) continue;
    let score = 0;
    for (const purchasedId of purchasedProducts) {
      score += (relatedProducts.get(purchasedId) || 0) * 1.5;
    }
    score += (popularityMap?.get(productId) || 0) * 0.05;
    if (score > 0)
      candidates.push({ productId, score, source: "personalized" });
  }

  if (!candidates.length) {
    return popularCandidates(popularityMap, purchasedProducts, safeLimit);
  }

  return candidates
    .sort(
      (candidateA, candidateB) =>
        candidateB.score - candidateA.score ||
        candidateA.productId.localeCompare(candidateB.productId),
    )
    .slice(0, safeLimit)
    .map((candidate) => ({
      ...candidate,
      score: Number(candidate.score.toFixed(6)),
    }));
};

const fetchRecommendationData = async () => {
  const orders = await Order.find({
    $or: [{ orderStatus: "delivered" }, { "paymentDetails.status": "paid" }],
  })
    .select("user items.product orderStatus paymentDetails.status")
    .lean();
  const successfulOrders = orders.filter(isSuccessfulPurchase);
  return {
    successfulOrders,
    similarityMap: buildProductSimilarityMap(successfulOrders),
    popularityMap: buildPopularityMap(successfulOrders),
  };
};

const getRecommendationsForUser = async (userId, limit = 8) => {
  const { successfulOrders, similarityMap, popularityMap } =
    await fetchRecommendationData();
  const purchasedProducts = new Set();
  if (userId) {
    for (const order of successfulOrders) {
      if (normalizeObjectId(order.user) !== String(userId)) continue;
      for (const item of order.items || []) {
        const productId = normalizeObjectId(item.product);
        if (productId) purchasedProducts.add(productId);
      }
    }
  }

  return generateRecommendationCandidates({
    userId,
    userPurchasedProducts: purchasedProducts,
    similarityMap,
    popularityMap,
    limit,
  });
};

const getPurchasedProductIdsForUser = async (userId) => {
  if (!userId) return [];
  const orders = await Order.find({
    user: userId,
    $or: [{ orderStatus: "delivered" }, { "paymentDetails.status": "paid" }],
  })
    .select("items.product orderStatus paymentDetails.status")
    .lean();

  return [
    ...new Set(
      orders
        .filter(isSuccessfulPurchase)
        .flatMap((order) =>
          (order.items || [])
            .map((item) => normalizeObjectId(item.product))
            .filter(Boolean),
        ),
    ),
  ];
};

module.exports = {
  buildUserItemMatrix,
  buildProductSimilarityMap,
  buildPopularityMap,
  generateRecommendationCandidates,
  getRecommendationsForUser,
  getPurchasedProductIdsForUser,
  isSuccessfulPurchase,
};
