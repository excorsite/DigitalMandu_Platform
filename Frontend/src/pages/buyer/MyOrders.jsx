import { useOrders } from "../../api/hooks";
import { SkeletonTableLoader } from "../../components/common/SkletonLoader";

const getOrderStatusLabel = (status) => {
  const labels = {
    pending: "Awaiting seller approval",
    confirmed: "Approved by seller",
    preparation: "Preparing your order",
    ontheway: "On the way",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status] || "Awaiting seller approval";
};

const getPaymentStatusLabel = (status) => {
  if (status === "paid") return "Paid successfully";
  if (status === "unpaid") return "Payment due";
  return "Payment pending";
};

export default function MyOrders() {
  const { data, isLoading, error } = useOrders();
  if (isLoading) return <SkeletonTableLoader />;
  if (error) return <p className="text-red-600">{error.message}</p>;
  const orders = data?.data || data || [];
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">
          No orders yet. Place an order from cart.
        </p>
      ) : (
        orders.map((o) => (
          <div
            key={o._id}
            className="bg-white p-4 rounded-xl border border-gray-200 mb-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">
                  Order #{String(o._id).slice(-8)}{" "}
                  <span className="text-xs font-normal text-gray-500">
                    {new Date(o.createdAt).toLocaleString()}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Status:{" "}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${o.orderStatus === "confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-700"}`}
                  >
                    {getOrderStatusLabel(
                      o.orderStatus || o.status || "pending",
                    )}
                  </span>{" "}
                  · {o.paymentDetails?.method || "cod"} ·{" "}
                  <span
                    className={
                      o.paymentDetails?.status === "paid"
                        ? "font-semibold text-emerald-700"
                        : "text-amber-700"
                    }
                  >
                    {getPaymentStatusLabel(
                      o.paymentDetails?.status || "pending",
                    )}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Ship to: {o.shippingAddress}
                </p>
                {o.items?.length ? (
                  <p className="text-xs text-gray-500 mt-2">
                    {o.items.length} items:{" "}
                    {o.items
                      .map(
                        (it) =>
                          `${it.product?.productName || it.product} x${it.quantity}`,
                      )
                      .join(", ")}
                  </p>
                ) : null}
              </div>
              <p className="font-bold text-primary text-lg">
                Rs {o.totalAmount ?? o.totalPrice ?? 0}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
