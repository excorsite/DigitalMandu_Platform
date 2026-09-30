import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useProductDetail,
  useAddToCart,
  useProductReviews,
  useCreateReview,
} from "../../api/hooks";
import { SkeletonTableLoader } from "../../components/common/SkletonLoader";
import { PrimaryButton } from "../../components/common/Button";
import { assets } from "../../assets/assets";
import { getProductImage, handleImgError } from "../../utils/productImage";
import { BasketIcon } from "../../assets/data/icons";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

export default function ProductDetails() {
  const { id } = useParams();
  const { data, isLoading } = useProductDetail(id);
  const { data: reviews } = useProductReviews(id);
  const { mutate: addToCart, isPending } = useAddToCart();
  const createReview = useCreateReview(id);
  const { user, isAuthenticated } = useAuthStore();
  const [userRating, setUserRating] = useState(5);
  const [userMessage, setUserMessage] = useState("");

  useEffect(() => {
    if (isLoading || window.location.hash !== "#reviews") return undefined;
    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById("reviews")
        ?.scrollIntoView({ behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [id, isLoading]);

  if (isLoading) return <SkeletonTableLoader />;
  const product = data?.data || data;
  if (!product)
    return (
      <div className="text-center py-12">
        <img
          src={assets.basket_icon}
          alt=""
          className="mx-auto h-16 opacity-40 mb-3"
        />
        <p>Product not found</p>
      </div>
    );
  const reviewsList = reviews?.data || reviews || [];
  const canReview =
    isAuthenticated && user?.role !== "admin" && user?.role !== "seller";
  const submitReview = (event) => {
    event.preventDefault();
    const message = userMessage.trim();
    if (!message) return toast.error("Please write a review");
    createReview.mutate(
      { userRating: Number(userRating), userMessage: message },
      { onSuccess: () => setUserMessage("") },
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-green-footer rounded-xl p-4 border border-green-border">
        <img
          src={getProductImage(product, 0)}
          alt={product.productName || product.name}
          onError={(e) => handleImgError(e, 0)}
          className="w-full h-[380px] object-cover rounded-lg"
        />
      </div>
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 mb-2">
          {product.productName || product.name}
        </h1>
        <div className="flex items-center gap-2 mb-3">
          <img src={assets.rating_starts} alt="rating" className="h-4" />
          <span className="text-sm text-gray-600">
            ({reviewsList.length} reviews)
          </span>
        </div>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {product.productDescription || product.description}
        </p>
        <p className="text-primary font-bold text-2xl mb-6">
          Rs {product.productPrice || product.price}
        </p>
        <div className="flex gap-3">
          <PrimaryButton
            label={isPending ? "Adding..." : "Add to Cart"}
            loading={isPending}
            onClick={() =>
              addToCart(
                { productID: id },
                {
                  onSuccess: () => toast.success("Added to cart"),
                  onError: (e) =>
                    toast.error(e.response?.data?.message || "Failed"),
                },
              )
            }
          />
          <span className="inline-flex items-center gap-2 text-sm text-gray-600 border border-green-border rounded-lg px-4 bg-green-footer">
            <BasketIcon className="size-4 text-primary" /> Free delivery
          </span>
        </div>
        <div
          id="reviews"
          className="mt-8 scroll-mt-8 border-t border-gray-200 pt-6"
        >
          <h3 className="font-semibold font-serif mb-3">Reviews</h3>
          {Array.isArray(reviewsList) && reviewsList.length > 0 ? (
            <ul className="space-y-3">
              {reviewsList.map((r, i) => (
                <li
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg p-3 text-sm"
                >
                  <p className="font-medium">
                    {r.userId?.name || r.userName || "Customer"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-emerald-800">
                    Rating: {r.rating}/5
                  </p>
                  <p className="mt-1 text-gray-600">
                    {r.message || r.comment || r.review || r.text}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-dashed">
              No reviews yet. Be the first to review!
            </p>
          )}
          {canReview ? (
            <form
              onSubmit={submitReview}
              className="mt-5 space-y-3 rounded-lg border border-gray-200 bg-white p-4"
            >
              <h4 className="font-semibold text-gray-900">Write a review</h4>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="review-rating"
              >
                Your rating
              </label>
              <select
                id="review-rating"
                value={userRating}
                onChange={(event) => setUserRating(Number(event.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} out of 5
                  </option>
                ))}
              </select>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="review-message"
              >
                Your review
              </label>
              <textarea
                id="review-message"
                value={userMessage}
                onChange={(event) => setUserMessage(event.target.value)}
                maxLength={1000}
                rows={4}
                required
                placeholder="Share what you thought about this product"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                disabled={createReview.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createReview.isPending ? "Submitting..." : "Submit review"}
              </button>
            </form>
          ) : (
            <p className="mt-5 text-sm text-gray-600">
              <Link
                to="/login"
                className="font-medium text-primary underline underline-offset-2"
              >
                Sign in
              </Link>{" "}
              as a customer to write a review.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
