import { useProducts, useRecommendations } from "../../api/hooks";
import { useNavigate } from "react-router-dom";
import { assets, menu_list } from "../../assets/assets";
import { getProductImage, handleImgError } from "../../utils/productImage";
import { BasketIcon } from "../../assets/data/icons";

export default function Home() {
  const { data, isLoading, error } = useProducts({ page: 1, limit: 20 });
  const recommendationsQuery = useRecommendations();
  const navigate = useNavigate();
  const products = data?.data || data?.products || [];
  const recommendations = recommendationsQuery.data?.recommendations || [];
  return (
    <div className="space-y-10">
      <section
        className="relative flex flex-col items-center gap-8 overflow-hidden rounded-2xl bg-primary p-8 md:flex-row md:p-12"
        style={{ background: "hsl(var(--theme-primary))" }}
      >
        <div className="flex-1 text-white">
          <h1 className="font-serif text-4xl font-bold leading-tight md:text-5xl">
            Order your favourite food here
          </h1>
          <p className="mt-4 max-w-xl text-white/90">
            Choose from a diverse menu featuring a delectable array of dishes
            crafted with the finest ingredients and culinary expertise.
          </p>
          <button
            onClick={() =>
              document
                .getElementById("menu")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-6 rounded-full bg-white px-8 py-3 font-semibold text-primary transition hover:bg-green-footer"
          >
            View Menu
          </button>
        </div>
        <img
          src={assets.header_img}
          alt="Delicious food"
          className="h-[300px] w-full rounded-xl object-cover shadow-lg md:w-[520px]"
        />
      </section>

      {/* Menu — uses assets/menu_*.png via menu_list */}
      <section
        id="menu"
        aria-labelledby="menu-heading"
        className="border-b border-gray-200 pb-7"
      >
        <h2
          id="menu-heading"
          className="text-2xl font-bold font-serif text-primary mb-5"
        >
          Explore our menu
        </h2>
        <p className="mb-6 max-w-2xl text-sm text-gray-600">
          Choose from a diverse menu featuring a delectable array of dishes. Our
          mission is to satisfy your cravings.
        </p>
        <div className="flex gap-6 overflow-x-auto scrollbar-hidden pb-2">
          {menu_list.map((m) => (
            <div
              key={m.menu_name}
              className="flex flex-col items-center gap-2 shrink-0 cursor-pointer hover:opacity-80 transition"
            >
              <img
                src={m.menu_image}
                alt={m.menu_name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-green-footer"
              />
              <span className="text-sm font-medium text-gray-700">
                {m.menu_name}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="recommendations-heading"
        className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-7"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
              {recommendationsQuery.isLoading
                ? "Finding your next favorite"
                : recommendationsQuery.data?.source === "personalized"
                  ? "Picked from your order history"
                  : recommendationsQuery.data?.source === "popular"
                    ? "Loved by our customers"
                    : "Fresh from our menu"}
            </p>
            <h2
              id="recommendations-heading"
              className="text-2xl font-bold font-serif text-gray-900 sm:text-3xl"
            >
              {recommendationsQuery.data?.source === "personalized"
                ? "Picked for you"
                : recommendationsQuery.data?.source === "popular"
                  ? "Popular right now"
                  : "Recommended picks"}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {recommendationsQuery.data?.source === "personalized"
                ? "Suggestions inspired by completed orders."
                : recommendationsQuery.data?.source === "popular"
                  ? "Frequently ordered favorites, ready to discover."
                  : "A few available dishes to get you started."}
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900">
            {recommendationsQuery.isLoading
              ? "Loading picks"
              : recommendationsQuery.data?.source === "personalized"
                ? "For you"
                : recommendationsQuery.data?.source === "popular"
                  ? "Popular"
                  : "Featured"}
          </span>
        </div>
        {recommendationsQuery.isLoading ? (
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Loading recommendations"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-lg bg-white/80"
              />
            ))}
          </div>
        ) : recommendationsQuery.isError ? (
          <p className="rounded-lg bg-white/80 p-5 text-sm text-gray-600">
            Recommendations are unavailable right now.
          </p>
        ) : recommendations.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recommendations.map((product, index) => (
              <article
                key={product._id}
                className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-48 overflow-hidden bg-green-footer">
                  <img
                    src={getProductImage(product, index)}
                    alt={product.productName || product.name}
                    onError={(event) => handleImgError(event, index)}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-900 shadow-sm">
                    {product.recommendationSource === "personalized"
                      ? "For you"
                      : product.recommendationSource === "popular"
                        ? "Popular"
                        : "Featured"}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="truncate font-semibold text-gray-900">
                    {product.productName || product.name}
                  </h3>
                  <p className="mt-1 h-10 line-clamp-2 text-sm text-gray-500">
                    {product.productDescription || product.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-bold text-primary">
                      Rs {product.productPrice ?? product.price}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="rounded-full bg-primary p-2 text-white transition hover:bg-green-700"
                      aria-label={`View ${product.productName || product.name}`}
                    >
                      <BasketIcon className="size-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-white/80 p-5 text-sm text-gray-600">
            No recommendations are available yet.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-6 font-serif text-2xl font-bold text-gray-900">
          Top dishes near you
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading &&
            Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-lg bg-gray-100"
                aria-hidden="true"
              />
            ))}
          {!isLoading && error && (
            <p className="col-span-full text-sm text-red-600">
              Products are unavailable right now.
            </p>
          )}
          {!isLoading &&
            !error &&
            products.map((product, index) => (
              <article
                key={product._id}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-lg"
              >
                <div className="relative h-48 overflow-hidden bg-green-footer">
                  <img
                    src={getProductImage(product, index)}
                    alt={product.productName || product.name}
                    onError={(event) => handleImgError(event, index)}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-primary">
                    <img src={assets.rating_starts} alt="" className="h-3" />{" "}
                    4.5
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="truncate font-semibold text-gray-900">
                    {product.productName || product.name}
                  </h3>
                  <p className="mt-1 h-10 line-clamp-2 text-sm text-gray-500">
                    {product.productDescription || product.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-bold text-primary">
                      Rs {product.productPrice ?? product.price}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="rounded-full bg-primary p-2 text-white transition hover:bg-green-700"
                      aria-label={`View ${product.productName || product.name}`}
                    >
                      <BasketIcon className="size-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          {!isLoading && !error && products.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
              <img
                src={assets.basket_icon}
                alt=""
                className="mx-auto mb-3 h-16 opacity-40"
              />
              <p className="text-gray-600">
                No products found. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
