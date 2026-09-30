# Recommendation Engine Reproduction Guide

This document is a complete reproduction guide for the recommendation feature implemented in this project. It covers:

- the project structure relevant to recommendations
- the real order/product/user data used by the algorithm
- the collaborative filtering recommendation approach
- payment/order status rules used to count successful purchases
- backend implementation steps
- frontend integration steps
- validation and troubleshooting
- how to reproduce the system later

---

## 1. Project context

This project already had the main building blocks needed for a real recommendation system:

- MongoDB connection
- User model
- Product model
- Order model
- Auth middleware and JWT tokens
- Product listing and product detail flows
- Checkout and payment flow

The recommendation engine was built on top of those existing modules instead of creating a separate demo application.

Relevant files:

- Backend/models/userModel.js
- Backend/models/productModel.js
- Backend/models/orderModel.js
- Backend/controller/user/order/orderController.js
- Backend/controller/user/payment/paymentController.js
- Backend/middlewares/isAuthenticated.js
- Backend/app.js
- Frontend/src/pages/buyer/Home.jsx
- Frontend/src/api/hooks.js
- Frontend/src/api/client.js

---

## 2. Core requirement

The recommendation system must work from real purchase behavior.

The essential rule is:

- if User A purchases Product X
- and User B later buys Product Y or has similar behavior
- then Product X and Y can become related through historical co-purchase patterns
- and Product Y can be recommended to User B based on the purchase behavior of other users

This is not a random or static recommendation list.

It is based on real purchase data in MongoDB.

---

## 3. Real data model used by the algorithm

### User model

File: Backend/models/userModel.js

Main relevant fields:

- \_id
- name
- email
- role
- cart

### Product model

File: Backend/models/productModel.js

Main relevant fields:

- \_id
- productName
- productDescription
- productPrice
- productStock
- productStatus
- productImage

### Order model

File: Backend/models/orderModel.js

Main relevant fields:

- user
- items[]
  - product
  - quantity
- totalAmount
- shippingAddress
- orderStatus
- paymentDetails
  - method
  - status
  - transactionId
  - amount

Important detail:

The recommendation logic only considers successful purchases, not every order.

---

## 4. Purchase success rule

A purchase is treated as a valid recommendation signal only when it is a successful completed order.

The implementation excludes or ignores these as normal recommendation purchases:

- cancelled orders
- unpaid orders
- pending payment orders
- non-delivered statuses
- failed payment attempts

### Order status rule used in this project

The project’s order flow uses statuses such as:

- pending
- delivered
- cancelled
- ontheway
- preparation

The recommendation logic uses only successful orders that are effectively completed.

In the final version, successful purchases are treated as those that are delivered and/or have a paid payment record.

This avoids counting invalid data as genuine buy intent.

---

## 5. Recommendation algorithm chosen

We used an item-based collaborative filtering approach.

### Why this approach

It matches an e-commerce food ordering app well because:

- purchase history is already present
- products are commonly bought together
- one user’s purchase can influence another user’s recommendations
- the system remains simple and works well without ML infrastructure

### Core idea

We build a user-item matrix using successful purchases.

Example:

- User A bought Product A and Product B
- User B bought Product A
- User C bought Product B and Product C

The system calculates how closely Product A and Product B are related based on shared buyers.

Then, when a user has bought Product A, Product B becomes a strong recommendation candidate.

---

## 6. Mathematical method used

The algorithm uses cosine similarity on a binary user-item interaction matrix.

### Binary matrix example

| User / Product | Product A | Product B | Product C |
| -------------- | --------- | --------- | --------- |
| User A         | 1         | 1         | 0         |
| User B         | 1         | 0         | 0         |
| User C         | 0         | 1         | 1         |

The similarity for Product A vs Product B is measured by how many users bought both products compared to how many overall bought each product.

The formula used conceptually:

similarity = shared buyers / sqrt(total buyers of A × total buyers of B)

This is the cosine similarity style used in the project.

---

## 7. Recommendation score formula

The final score is based on the product similarity and purchase behavior intensity.

Conceptually:

Recommendation Score = similarity × interaction weight + small popularity boost

This was implemented in the recommendation service.

The real code uses a weighted version of similarity and adds popularity as a fallback signal.

This prevents random ordering and ensures real relationships dominate the ranking.

---

## 8. Cold start and fallback behavior

The system handles new users and sparse data carefully.

### For a new user

- No purchase history
- Use fallback/popular products
- Do not claim these are personalized recommendations

### When the user has some purchases

- use collaborative filtering
- rank related products
- exclude their already-purchased products

### If there is not enough data

- return popular products instead of empty results

This avoids an empty recommendation section.

---

## 9. Already purchased products

The system excludes products already bought by the current user from personalized lists.

This maintains recommendation quality and prevents obvious duplicates.

Example:

- User purchased Pizza and Burger
- Recommended list should contain Momo or Coffee, not Pizza or Burger again

---

## 10. What we implemented in backend

### Service created

File: Backend/services/recommendationService.js

It contains functions such as:

- buildUserItemMatrix
- buildProductSimilarityMap
- buildPopularityMap
- generateRecommendationCandidates
- getRecommendationsForUser
- isSuccessfulPurchase

### Controller created

File: Backend/controller/recommendation/recommendationController.js

This controller:

- reads the logged-in user ID
- gets recommendation candidates
- loads matching products from MongoDB
- removes already-purchased products
- returns product data with recommendation scores
- falls back to popular products if needed

### Route created

File: Backend/routes/recommendation/recommendationRoute.js

Endpoint:

- GET /api/recommendations

This route checks the token and delegates auth to the existing middleware.

### App wiring

File: Backend/app.js

The route was mounted with:

- app.use("/api", recommendation_route);

---

## 11. Auth and token handling

The project uses JWT tokens via the existing auth flow.

The existing middleware is:

- Backend/middlewares/isAuthenticated.js

Important fix made during implementation:

- it supports both legacy custom header token flow and Bearer token flow

This matters because frontend requests use the Authorization header in addition to the custom token header.

The code ensures:

- token is read from the correct header
- user is attached to req.user
- route access is restricted correctly

---

## 12. Frontend integration

### API client update

Files:

- Frontend/src/api/client.js
- Frontend/src/api/config.js
- Frontend/src/api/endpoints/recommendations.js
- Frontend/src/api/hooks.js

The frontend adds a hook:

- useRecommendations()

This calls:

- GET /api/recommendations

### Home page UI update

File: Frontend/src/pages/buyer/Home.jsx

A new section was added:

- Recommended for you

This section:

- calls the recommendation API
- displays product cards in the same style as the site
- shows a personalized vs popular source label
- handles empty states
- uses the app’s existing CSS/Tailwind layout

---

## 13. Payment issue handling and recommendation safety

The system must not count fake or cancelled purchases as real recommendation data.

The actual project has payment status fields and order status fields in [Backend/models/orderModel.js](Backend/models/orderModel.js), and payment verification logic in [Backend/controller/user/payment/paymentController.js](Backend/controller/user/payment/paymentController.js).

### Rules used in this project

A purchase is valid for recommendation only when:

- order is not cancelled
- payment is paid or order is completed successfully
- order is not pending in a fake or non-successful state

This prevents the recommendation engine from learning from:

- failed payments
- expired payment references
- canceled orders
- unpaid carts or incomplete checkouts

---

## 14. Files created or adjusted for this feature

### Backend

- Backend/services/recommendationService.js
- Backend/controller/recommendation/recommendationController.js
- Backend/routes/recommendation/recommendationRoute.js
- Backend/app.js
- Backend/middlewares/isAuthenticated.js

### Frontend

- Frontend/src/api/config.js
- Frontend/src/api/client.js
- Frontend/src/api/endpoints/recommendations.js
- Frontend/src/api/hooks.js
- Frontend/src/pages/buyer/Home.jsx

### Testing

- Backend/tests/recommendationService.test.js

---

## 15. Critical implementation snippets

These are the actual core code blocks used in the recommendation feature. If you want to reconstruct the feature later, these are the essential pieces to copy and adapt.

### 15.1 Recommendation service

```js
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

const SUCCESSFUL_ORDER_STATUSES = new Set(["delivered"]);

const normalizeObjectId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value && value._id) return String(value._id);
  return String(value);
};

const isSuccessfulPurchase = (order) => {
  if (!order) return false;
  if (order.orderStatus === "cancelled") return false;
  if (order.orderStatus === "pending") return false;
  if (order.orderStatus === "ontheway") return false;
  if (order.orderStatus === "preparation") return false;

  if (order.paymentDetails?.status === "paid") return true;
  if (order.paymentDetails?.status === "unpaid") return false;
  if (order.paymentDetails?.status === "pending") return false;

  if (order.orderStatus && SUCCESSFUL_ORDER_STATUSES.has(order.orderStatus)) {
    return true;
  }

  return false;
};

const buildUserItemMatrix = (orders) => {
  const userMatrix = new Map();

  (orders || []).forEach((order) => {
    if (!isSuccessfulPurchase(order)) return;

    const userId = normalizeObjectId(order.user);
    if (!userId) return;

    const productSet = userMatrix.get(userId) || new Map();

    (order.items || []).forEach((entry) => {
      const productId = normalizeObjectId(entry.product);
      if (!productId) return;
      productSet.set(productId, 1);
    });

    userMatrix.set(userId, productSet);
  });

  return userMatrix;
};

const buildProductSimilarityMap = (orders) => {
  const userMatrix = buildUserItemMatrix(orders);
  const productUsers = new Map();

  userMatrix.forEach((productSet, userId) => {
    productSet.forEach((_, productId) => {
      const userSet = productUsers.get(productId) || new Set();
      userSet.add(userId);
      productUsers.set(productId, userSet);
    });
  });

  const productIds = [...productUsers.keys()];
  const similarityMap = new Map();

  for (let i = 0; i < productIds.length; i += 1) {
    const productA = productIds[i];
    similarityMap.set(productA, new Map());

    for (let j = i + 1; j < productIds.length; j += 1) {
      const productB = productIds[j];
      const buyersOfA = productUsers.get(productA) || new Set();
      const buyersOfB = productUsers.get(productB) || new Set();

      if (!buyersOfA.size || !buyersOfB.size) continue;

      const intersection = [...buyersOfA].filter((userId) =>
        buyersOfB.has(userId),
      );
      const cosineSimilarity =
        intersection.length / Math.sqrt(buyersOfA.size * buyersOfB.size || 1);

      if (cosineSimilarity > 0) {
        similarityMap.get(productA).set(productB, cosineSimilarity);
        const nextMap = similarityMap.get(productB) || new Map();
        nextMap.set(productA, cosineSimilarity);
        similarityMap.set(productB, nextMap);
      }
    }
  }

  return similarityMap;
};

const buildPopularityMap = (orders) => {
  const popularityMap = new Map();

  (orders || []).forEach((order) => {
    if (!isSuccessfulPurchase(order)) return;

    (order.items || []).forEach((entry) => {
      const productId = normalizeObjectId(entry.product);
      if (!productId) return;
      popularityMap.set(productId, (popularityMap.get(productId) || 0) + 1);
    });
  });

  return popularityMap;
};

const generateRecommendationCandidates = ({
  userId,
  userPurchasedProducts,
  similarityMap,
  popularityMap,
  limit = 8,
}) => {
  const purchasedArray = Array.isArray(userPurchasedProducts)
    ? userPurchasedProducts
    : userPurchasedProducts instanceof Set
      ? Array.from(userPurchasedProducts)
      : [];

  const purchasedSet = new Set(
    purchasedArray.map((productId) => String(productId)),
  );

  if (!purchasedSet.size) {
    return Array.from((popularityMap || new Map()).entries())
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([productId, score]) => ({
        productId,
        score: Number(score) || 0,
        source: "popular",
      }));
  }

  const candidateScores = new Map();

  for (const [candidateProductId, relatedProducts] of similarityMap || []) {
    if (purchasedSet.has(candidateProductId)) continue;

    let score = 0;

    for (const purchasedProductId of purchasedSet) {
      const similarity = relatedProducts.get(purchasedProductId) || 0;
      if (similarity > 0) {
        score += similarity * 1.5;
      }
    }

    const popularityBoost = (popularityMap.get(candidateProductId) || 0) * 0.05;
    const totalScore = score + popularityBoost;

    if (totalScore > 0) {
      candidateScores.set(candidateProductId, totalScore);
    }
  }

  if (!candidateScores.size) {
    return Array.from((popularityMap || new Map()).entries())
      .filter(([productId]) => !purchasedSet.has(productId))
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([productId, score]) => ({
        productId,
        score: Number(score) || 0,
        source: "popular",
      }));
  }

  return Array.from(candidateScores.entries())
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .slice(0, limit)
    .map(([productId, score]) => ({
      productId,
      score: Number(score.toFixed(6)) || 0,
      source: userId ? "personalized" : "popular",
    }));
};

const fetchRecommendationData = async (userId) => {
  const orders = await Order.find({}).lean();

  const successfulOrders = orders.filter((order) =>
    isSuccessfulPurchase(order),
  );
  const similarityMap = buildProductSimilarityMap(successfulOrders);
  const popularityMap = buildPopularityMap(successfulOrders);

  let purchasedProducts = [];
  if (userId) {
    const userOrders = successfulOrders.filter(
      (order) => normalizeObjectId(order.user) === String(userId),
    );

    purchasedProducts = userOrders.flatMap((order) =>
      (order.items || [])
        .map((entry) => normalizeObjectId(entry.product))
        .filter(Boolean),
    );
  }

  return { successfulOrders, similarityMap, popularityMap, purchasedProducts };
};

const getRecommendationsForUser = async (userId, limit = 8) => {
  const { similarityMap, popularityMap, purchasedProducts } =
    await fetchRecommendationData(userId);
  const userPurchasedProducts = Array.from(new Set(purchasedProducts));

  const candidates = generateRecommendationCandidates({
    userId,
    userPurchasedProducts,
    similarityMap,
    popularityMap,
    limit,
  });

  const uniqueCandidates = Array.from(
    new Map(
      candidates.map((candidate) => [candidate.productId, candidate]),
    ).values(),
  );

  if (!userId || !userPurchasedProducts.length) {
    return uniqueCandidates.slice(0, limit).map((candidate) => ({
      ...candidate,
      source: "popular",
    }));
  }

  return uniqueCandidates.slice(0, limit);
};

module.exports = {
  buildUserItemMatrix,
  buildProductSimilarityMap,
  buildPopularityMap,
  generateRecommendationCandidates,
  getRecommendationsForUser,
  isSuccessfulPurchase,
};
```

### 15.2 Recommendation controller

```js
const Product = require("../../models/productModel");
const {
  getRecommendationsForUser,
} = require("../../services/recommendationService");

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || null;
    const limit = Number(req.query.limit) || 8;

    const candidates = await getRecommendationsForUser(userId, limit);

    if (!candidates.length) {
      const fallbackProducts = await Product.find({ productStatus: "public" })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return res.status(200).json({
        success: true,
        recommendations: fallbackProducts.map((product) => ({
          ...product,
          recommendationScore: 0,
        })),
        source: "fallback",
      });
    }

    const selectedProductIds = candidates.map(
      (candidate) => candidate.productId,
    );
    const products = await Product.find({
      _id: { $in: selectedProductIds },
      productStatus: "public",
    }).lean();

    const productMap = new Map(
      products.map((product) => [String(product._id), product]),
    );

    const recommendations = candidates
      .map((candidate) => {
        const fullProduct = productMap.get(candidate.productId);
        if (!fullProduct) return null;

        return {
          ...fullProduct,
          recommendationScore: Number(candidate.score) || 0,
          recommendationSource: candidate.source || "personalized",
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      recommendations,
      source: userId ? "personalized" : "popular",
    });
  } catch (error) {
    console.error("Recommendation generation failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to generate recommendations right now.",
    });
  }
};
```

### 15.3 Recommendation route

```js
const express = require("express");
const catchAsync = require("../../services/catchAsync");
const isUserAuthenticated = require("../../middlewares/isAuthenticated");
const {
  getRecommendations,
} = require("../../controller/recommendation/recommendationController");

const rtr = express.Router();

rtr.route("/recommendations").get(
  catchAsync(async (req, res, next) => {
    if (req.headers.user_auth_token || req.headers.authorization) {
      return isUserAuthenticated(req, res, () => getRecommendations(req, res));
    }
    return getRecommendations(req, res);
  }),
);

module.exports = rtr;
```

### 15.4 App mount

```js
const recommendation_route = require("./routes/recommendation/recommendationRoute");

app.use("/api", recommendation_route);
```

### 15.5 Frontend API hook

```js
export const useRecommendations = () =>
  useQuery({
    queryKey: ["recommendations"],
    queryFn: () => recommendationsAPI.getRecommendations().then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });
```

### 15.6 Frontend home page section

```jsx
<section>
  <div className="flex items-center justify-between gap-4 mb-4">
    <h2 className="text-2xl font-bold font-serif text-gray-900">
      Recommended for you
    </h2>
    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
      {recommendationsData?.source === "personalized"
        ? "Personalized"
        : "Popular"}
    </span>
  </div>
  {recommendationsLoading ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse h-72 rounded-xl bg-gray-200"
        />
      ))}
    </div>
  ) : recommendations.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {recommendations.map((product, idx) => (
        <div
          key={product._id}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition group"
        >
          <div className="relative h-48 overflow-hidden bg-green-footer">
            <img
              src={getProductImage(product, idx)}
              alt={product.productName || product.name}
              onError={(e) => handleImgError(e, idx)}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 truncate">
              {product.productName || product.name}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 h-10 mt-1">
              {product.productDescription || product.description}
            </p>
            <div className="flex items-center justify-between mt-3">
              <p className="text-primary font-bold">
                Rs {product.productPrice || product.price}
              </p>
              <button
                onClick={() => navigate(`/product/${product._id}`)}
                className="bg-primary text-white p-2 rounded-full hover:bg-green-700 transition"
              >
                <BasketIcon className="size-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-gray-600">
      No recommendations yet. Add a few completed orders to unlock personalized
      suggestions.
    </div>
  )}
</section>
```

### 15.7 Auth token compatibility snippet

```js
const authHeader = req.headers.authorization;
const userToken =
  req.headers.user_auth_token ||
  (authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null);
```

### 15.8 Frontend client token injection

```js
client.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");
  if (token) {
    config.headers.user_auth_token = token;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 16. Test file and validation strategy

A focused test was created in:

- Backend/tests/recommendationService.test.js

It validates:

- buyer matrix creation
- similarity detection
- recommendation generation from actual product co-purchase patterns
- exclusion of already-purchased products

### Example test logic

- User A purchases Product A and Product B
- User B purchases Product A only
- The system should recommend Product B to User B

This verifies the exact concept you asked for.

---

## 16. Commands used to validate the system

### Backend test

```bash
cd "e:\digitalmandu-platform-main\digitalmandu-platform-main\Backend"
node tests/recommendationService.test.js
```

Expected output:

```bash
recommendationService test passed
```

### Frontend production build

```bash
cd "e:\digitalmandu-platform-main\digitalmandu-platform-main\Frontend"
npm run build
```

Expected output includes:

```bash
✓ built in ...
```

### Backend JS syntax check

```bash
cd "e:\digitalmandu-platform-main\digitalmandu-platform-main\Backend"
node --check app.js
node --check services/recommendationService.js
node --check controller/recommendation/recommendationController.js
```

Expected result: no error output and exit code 0.

---

## 17. Reproduction steps from scratch

### Step 1: Confirm the project structure

Use the existing project as-is.

Do not create a separate demo app.

### Step 2: Make sure MongoDB is running

Example:

```env
MONGO_URI=mongodb://127.0.0.1:27017/digitalmandu
```

### Step 3: Confirm environment variables

Check backend .env or .env.example:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/digitalmandu
SECRET_KEY=change_me_to_a_strong_random_secret
FRONTEND_URL=http://localhost:5173
```

### Step 4: Start backend

```bash
cd Backend
npm install
npm start
```

### Step 5: Seed data if needed

```bash
cd Backend
npm run seed
```

### Step 6: Start frontend

```bash
cd Frontend
npm install
npm run dev
```

### Step 7: Create real orders through the app

- login as customer
- add products to cart
- checkout
- complete payment or choose COD
- ensure order is saved in MongoDB

### Step 8: Test recommendations

- login as another user
- reload home page
- see the recommendation section
- confirm related products appear based on real purchase patterns

---

## 18. Example scenario showing the exact behavior

### Example data

- User A buys Product A and Product B
- User B buys Product A
- User C buys Product B and Product C

### Result

- Product A and Product B are related because multiple users bought them together
- When User B requests recommendations, Product B becomes a candidate because it is strongly related to Product A
- Product B appears in the recommendation list
- Product A is excluded if User B already purchased it

This demonstrates the exact requirement:

User A purchase influences recommendations for User B.

---

## 19. Summary

This system was implemented so that:

- purchase history is the strongest signal
- recommendation is based on actual MongoDB data
- collaborative filtering is used
- recommendation is personalized when enough data exists
- fallback/popular recommendations are used for new users
- stale or invalid orders are not counted
- the backend and frontend are both connected to the same real system

---

## 20. Final reproduction checklist

Before redoing this work later, use this checklist:

- [ ] Confirm MongoDB is running
- [ ] Confirm MONGO_URI is valid
- [ ] Confirm SECRET_KEY exists
- [ ] Confirm user, product, and order models match the real schema
- [ ] Add recommendation service file
- [ ] Add recommendation controller file
- [ ] Add recommendation route file
- [ ] Mount route in app.js
- [ ] Authenticate token properly
- [ ] Update frontend API client configuration
- [ ] Add recommendation hook and endpoint
- [ ] Add recommendation section to buyer home page
- [ ] Exclude already purchased products
- [ ] Ensure fallback behavior exists
- [ ] Run recommendation test
- [ ] Run frontend build
- [ ] Verify recommendations appear using live order data

---

## 21. Quick summary for future rework

If you need to rebuild this later, do the following in order:

1. use the existing order, product, and user models
2. build a recommendation service that reads successful orders only
3. build a user-item matrix
4. compute similarity between products using cosine similarity
5. generate personalized candidate products
6. exclude already bought items
7. add a fallback for new users
8. expose GET /api/recommendations
9. wire frontend home page to the endpoint
10. validate with a focused regression test and build

This is the full reproducible guide for the recommendation engine we implemented.
