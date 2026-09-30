const Product = require("../../models/productModel");
const {
  getRecommendationsForUser,
  getPurchasedProductIdsForUser,
} = require("../../services/recommendationService");

exports.getRecommendations = async (req, res) => {
  const requestedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(20, requestedLimit))
    : 8;
  const userId = req.user?._id || req.user?.id || null;
  const candidates = await getRecommendationsForUser(userId, limit);
  const recommendations = [];

  if (candidates.length) {
    const products = await Product.find({
      _id: { $in: candidates.map((candidate) => candidate.productId) },
      productStatus: "public",
      productStock: { $gt: 0 },
    }).lean();
    const productMap = new Map(
      products.map((product) => [String(product._id), product]),
    );
    recommendations.push(
      ...candidates.flatMap((candidate) => {
        const product = productMap.get(candidate.productId);
        return product
          ? [
              {
                ...product,
                recommendationScore: candidate.score,
                recommendationSource: candidate.source,
              },
            ]
          : [];
      }),
    );
  }

  if (recommendations.length < limit) {
    const purchasedProductIds = await getPurchasedProductIdsForUser(userId);
    const excludedIds = [
      ...purchasedProductIds,
      ...recommendations.map((product) => product._id),
    ];
    const fallbackProducts = await Product.find({
      productStatus: "public",
      productStock: { $gt: 0 },
      ...(excludedIds.length ? { _id: { $nin: excludedIds } } : {}),
    })
      .sort({ createdAt: -1 })
      .limit(limit - recommendations.length)
      .lean();
    recommendations.push(
      ...fallbackProducts.map((product) => ({
        ...product,
        recommendationScore: 0,
        recommendationSource: "featured",
      })),
    );
  }

  return res.status(200).json({
    success: true,
    recommendations,
    source: recommendations.some(
      (product) => product.recommendationSource === "personalized",
    )
      ? "personalized"
      : recommendations.some(
            (product) => product.recommendationSource === "popular",
          )
        ? "popular"
        : "featured",
  });
};
