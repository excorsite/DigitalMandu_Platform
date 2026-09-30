import { useCart, useRemoveFromCart, useUpdateCartItem } from "../../api/hooks";
import { PrimaryButton } from "../../components/common/Button";
import { useNavigate } from "react-router-dom";
import { SkeletonTableLoader } from "../../components/common/SkletonLoader";
import { assets } from "../../assets/assets";
import { getProductImage, handleImgError } from "../../utils/productImage";
import {
  getCartPrice,
  getCartName,
  getCartProduct,
  getCartProductId,
  calcSubtotal,
} from "../../utils/cart";
import { TrashIcon } from "../../assets/data/icons";
import { FiMinus, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";

export default function Cart() {
  const { data, isLoading } = useCart();
  const { mutate: remove } = useRemoveFromCart();
  const { mutate: updateQuantity, isPending: isUpdatingQuantity } =
    useUpdateCartItem();
  const navigate = useNavigate();
  if (isLoading) return <SkeletonTableLoader />;
  const items = data?.data || data?.items || data?.cart || [];
  if (!items.length)
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-dashed border-green-border bg-white px-6 py-14 text-center shadow-sm sm:px-10">
        <img
          src={assets.basket_icon}
          alt="Empty cart"
          className="mx-auto mb-5 h-20 opacity-60"
        />
        <p className="mb-2 text-xl font-semibold text-gray-900">
          Your cart is empty
        </p>
        <p className="mb-6 text-sm text-gray-500">
          Looks like you haven't added anything yet.
        </p>
        <PrimaryButton
          label="Continue Shopping"
          onClick={() => navigate("/")}
        />
      </div>
    );
  const subtotal = calcSubtotal(items);
  const itemCount = items.reduce(
    (count, item) => count + (Number(item.quantity) || 1),
    0,
  );
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-7 flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
            <img src={assets.basket_icon} alt="" className="h-7" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Your selection
            </p>
            <h1 className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl">
              Shopping Cart
            </h1>
          </div>
        </div>
        <span className="w-fit rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </header>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
        <div className="space-y-3">
          {items.map((item, idx) => {
            const prod = getCartProduct(item);
            const quantity = Number(item.quantity) || 1;
            const unitPrice = getCartPrice(item);
            const productId = getCartProductId(item);
            return (
              <div
                key={item._id || item.productId || idx}
                className="group grid grid-cols-[76px_minmax(0,1fr)] gap-x-4 gap-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:p-5"
              >
                <img
                  src={getProductImage(prod, idx)}
                  alt={getCartName(item)}
                  onError={(e) => handleImgError(e, idx)}
                  className="h-[76px] w-[76px] shrink-0 rounded-md border border-gray-100 object-cover sm:h-[88px] sm:w-[88px]"
                />
                <div className="min-w-0 self-center">
                  <p className="break-words font-semibold text-gray-900">
                    {getCartName(item)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Rs {unitPrice} <span className="text-gray-400">/ each</span>
                  </p>
                  <div className="mt-3 inline-flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                    <button
                      type="button"
                      disabled={
                        !item._id || quantity <= 1 || isUpdatingQuantity
                      }
                      onClick={() =>
                        updateQuantity({
                          cartID: item._id,
                          data: { quantity: quantity - 1 },
                        })
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-md text-gray-600 transition hover:bg-white hover:text-emerald-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Decrease ${getCartName(item)} quantity`}
                    >
                      <FiMinus aria-hidden="true" size={14} />
                    </button>
                    <span
                      className="min-w-9 text-center text-sm font-semibold tabular-nums text-gray-900"
                      aria-live="polite"
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={!item._id || isUpdatingQuantity}
                      onClick={() =>
                        updateQuantity({
                          cartID: item._id,
                          data: { quantity: quantity + 1 },
                        })
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-md text-gray-600 transition hover:bg-white hover:text-emerald-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Increase ${getCartName(item)} quantity`}
                    >
                      <FiPlus aria-hidden="true" size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={!productId}
                    onClick={() => navigate(`/product/${productId}#reviews`)}
                    className="mt-3 inline-block text-xs font-medium text-gray-500 underline decoration-gray-300 underline-offset-4 transition hover:text-emerald-700 disabled:opacity-50"
                  >
                    Read or write a review
                  </button>
                </div>
                <div className="col-span-2 flex items-center justify-between border-t border-gray-100 pt-3 sm:col-span-1 sm:h-full sm:min-w-24 sm:flex-col sm:items-end sm:justify-between sm:border-0 sm:pt-0">
                  <p className="font-semibold tabular-nums text-gray-900">
                    Rs {unitPrice * quantity}
                  </p>
                  <button
                    onClick={() =>
                      remove(item._id || item.productId, {
                        onSuccess: () => toast.success("Removed"),
                      })
                    }
                    className="rounded-md p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    aria-label={`Remove ${getCartName(item)}`}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <aside className="h-fit rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-6 lg:p-6">
          <h2 className="mb-5 flex items-center gap-3 font-serif text-lg font-semibold text-gray-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50">
              <img src={assets.bag_icon} alt="" className="h-5" />
            </span>
            Order Summary
          </h2>
          <div className="mb-5 space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium tabular-nums text-gray-900">
                Rs {subtotal}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Free
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-4 font-semibold">
              <span className="text-gray-900">Total</span>
              <span className="tabular-nums text-emerald-700">
                Rs {subtotal}
              </span>
            </div>
          </div>
          <PrimaryButton
            label="Proceed to Checkout"
            className="w-full justify-center rounded-md py-3 shadow-sm transition hover:shadow-md"
            onClick={() => navigate("/checkout")}
          />
          <img src={assets.cross_icon} alt="" className="hidden" />
        </aside>
      </div>
    </div>
  );
}
