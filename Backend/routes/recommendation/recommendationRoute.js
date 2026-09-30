const express = require("express");
const jwt = require("jsonwebtoken");
const catchAsync = require("../../services/catchAsync");
const {
  getRecommendations,
} = require("../../controller/recommendation/recommendationController");

const router = express.Router();

const attachOptionalUser = (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const token =
    req.headers.user_auth_token ||
    (authorization.startsWith("Bearer ") ? authorization.slice(7) : null);
  if (!token || !process.env.SECRET_KEY) return next();

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (decoded?.id) req.user = { _id: decoded.id };
  } catch {
    // Invalid or expired credentials receive the public popular list.
  }
  return next();
};

router.get(
  "/recommendations",
  attachOptionalUser,
  catchAsync(getRecommendations),
);

module.exports = router;
