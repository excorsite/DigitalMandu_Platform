import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import { API_ENDPOINTS } from "../../api/config";
import toast from "react-hot-toast";

const orderStatuses = [
  { value: "pending", label: "Pending approval" },
  { value: "confirmed", label: "Approved by seller" },
  { value: "preparation", label: "Preparing" },
  { value: "ontheway", label: "On the way" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const getStatusLabel = (status) =>
  orderStatuses.find((option) => option.value === status)?.label ||
  "Pending approval";

export default function SellerOrders() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => client.get(API_ENDPOINTS.ADMIN_ORDERS).then((r) => r.data),
  });
  const orders = data?.data || data?.orders || [];
  const update = useMutation({
    mutationFn: ({ id, status }) =>
      client.patch(API_ENDPOINTS.ADMIN_ORDER_UPDATE.replace(":id", id), {
        newOrderStatus: status,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });
  if (isLoading) return <div className="p-6">Loading orders...</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold font-serif mb-6">Orders Management</h1>
      {orders.length === 0 ? (
        <div className="bg-white border border-dashed rounded-xl p-12 text-center text-gray-500">
          No orders yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-green-footer border-b">
              <tr>
                <th className="p-3 text-left">Order</th>
                <th className="p-3">Status</th>
                <th className="p-3">Total</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <p className="font-medium">{o._id?.slice(-8)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${o.orderStatus === "confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-700"}`}
                    >
                      {getStatusLabel(o.orderStatus || o.status)}
                    </span>
                  </td>
                  <td className="p-3 text-center font-semibold">
                    Rs {o.totalAmount || o.totalPrice}
                  </td>
                  <td className="p-3 text-center flex gap-1 justify-center">
                    <select
                      aria-label={`Update order ${o._id?.slice(-8)} status`}
                      value={o.orderStatus || o.status || "pending"}
                      disabled={update.isPending}
                      onChange={(e) =>
                        update.mutate({ id: o._id, status: e.target.value })
                      }
                      className="border rounded px-2 py-1 text-xs disabled:opacity-60"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
