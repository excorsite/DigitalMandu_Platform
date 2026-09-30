import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import client from "../../api/client";
import { API_ENDPOINTS } from "../../api/config";
import { useProducts } from "../../api/hooks";
import { useAuthStore } from "../../store/authStore";

const orderStatusLabels = {
  pending: "Awaiting approval",
  confirmed: "Approved",
  preparation: "Preparing",
  ontheway: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const orderStatusColors = {
  pending: "#d97706",
  confirmed: "#059669",
  preparation: "#f59e0b",
  ontheway: "#2563eb",
  delivered: "#15803d",
  cancelled: "#dc2626",
};

const isRevenueOrder = (order) =>
  order.orderStatus !== "cancelled" &&
  (order.orderStatus === "delivered" ||
    order.paymentDetails?.status === "paid");

const formatDateKey = (date) => date.toISOString().slice(0, 10);

function Metric({ label, value, detail, tone = "green" }) {
  const toneClasses = {
    green: "border-l-emerald-600",
    amber: "border-l-amber-500",
    blue: "border-l-blue-600",
    slate: "border-l-slate-500",
  };

  return (
    <div
      className={`rounded-lg border border-gray-200 border-l-4 bg-white p-5 ${toneClasses[tone]}`}
    >
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{detail}</p>
    </div>
  );
}

function ChartPanel({ title, children }) {
  return (
    <section className="min-w-0 rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-base font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

export default function SellerDashboard() {
  const { user } = useAuthStore();
  const canViewDashboardStats = ["admin", "seller"].includes(user?.role);
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () =>
      client.get(API_ENDPOINTS.ADMIN_ORDERS).then((response) => response.data),
  });
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts({ page: 1, limit: 50 });
  const {
    data: userCountData,
    isLoading: userCountLoading,
    isError: userCountError,
  } = useQuery({
    queryKey: ["seller-dashboard-user-count"],
    queryFn: () =>
      client
        .get(API_ENDPOINTS.ADMIN_USER_COUNT)
        .then((response) => response.data),
    enabled: canViewDashboardStats,
  });

  const orders = useMemo(
    () => ordersData?.data || ordersData?.orders || [],
    [ordersData],
  );
  const products = useMemo(
    () => productsData?.data || productsData?.products || [],
    [productsData],
  );
  const error = ordersError || productsError;

  const analytics = useMemo(() => {
    const statusCounts = new Map();
    const dailyRevenue = new Map();
    const productSales = new Map();
    let revenue = 0;
    let completedOrders = 0;

    for (const order of orders) {
      const status = order.orderStatus || order.status || "pending";
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);

      if (isRevenueOrder(order)) {
        const amount = Number(order.totalAmount || order.totalPrice || 0);
        revenue += amount;
        completedOrders += 1;
        const createdAt = new Date(order.createdAt);
        if (!Number.isNaN(createdAt.getTime())) {
          const dateKey = formatDateKey(createdAt);
          dailyRevenue.set(dateKey, (dailyRevenue.get(dateKey) || 0) + amount);
        }
      }

      if (status !== "cancelled") {
        for (const item of order.items || []) {
          const product = Array.isArray(item.product)
            ? item.product[0]
            : item.product;
          const productId = product?._id || item.productId || item.product;
          if (!productId) continue;
          const productName =
            product?.productName ||
            product?.name ||
            `Product ${String(productId).slice(-6)}`;
          const key = String(productId);
          const current = productSales.get(key) || {
            name: productName,
            units: 0,
          };
          current.units += Number(item.quantity) || 1;
          productSales.set(key, current);
        }
      }
    }

    const dateKeys = Array.from({ length: 14 }, (_, index) => {
      const date = new Date();
      date.setUTCHours(0, 0, 0, 0);
      date.setUTCDate(date.getUTCDate() - 13 + index);
      return formatDateKey(date);
    });

    const inventory = { available: 0, lowStock: 0, soldOut: 0 };
    for (const product of products) {
      const stock = Number(product.productStock) || 0;
      if (stock <= 0) inventory.soldOut += 1;
      else if (stock <= 5) inventory.lowStock += 1;
      else inventory.available += 1;
    }

    return {
      revenue,
      completedOrders,
      awaitingApproval: statusCounts.get("pending") || 0,
      statusCounts,
      dateKeys,
      dailyRevenue,
      topProducts: [...productSales.values()]
        .sort((a, b) => b.units - a.units)
        .slice(0, 6),
      inventory,
    };
  }, [orders, products]);

  const statusOptions = useMemo(
    () => ({
      chart: {
        type: "pie",
        height: 280,
        backgroundColor: "transparent",
        spacing: [4, 4, 4, 4],
      },
      title: { text: undefined },
      tooltip: {
        pointFormat: "<b>{point.y}</b> orders ({point.percentage:.0f}%)",
      },
      plotOptions: {
        pie: {
          innerSize: "62%",
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: "{point.name}: {point.y}",
            style: { textOutline: "none", fontSize: "11px" },
          },
        },
      },
      series: [
        {
          name: "Orders",
          data: [...analytics.statusCounts.entries()].map(
            ([status, count]) => ({
              name: orderStatusLabels[status] || status,
              y: count,
              color: orderStatusColors[status] || "#64748b",
            }),
          ),
        },
      ],
      credits: { enabled: false },
      accessibility: { enabled: false },
    }),
    [analytics.statusCounts],
  );

  const revenueOptions = useMemo(
    () => ({
      chart: {
        type: "areaspline",
        height: 280,
        backgroundColor: "transparent",
        spacing: [8, 8, 8, 8],
      },
      title: { text: undefined },
      xAxis: {
        categories: analytics.dateKeys.map((date) => date.slice(5)),
        tickInterval: 2,
        lineColor: "#e5e7eb",
        labels: { style: { color: "#6b7280" } },
      },
      yAxis: {
        title: { text: "NPR", style: { color: "#6b7280" } },
        min: 0,
        gridLineColor: "#f1f5f9",
      },
      tooltip: { valuePrefix: "Rs ", valueDecimals: 0 },
      plotOptions: {
        areaspline: {
          marker: { enabled: false },
          lineWidth: 2,
          fillOpacity: 0.12,
        },
      },
      series: [
        {
          name: "Paid / delivered revenue",
          data: analytics.dateKeys.map(
            (date) => analytics.dailyRevenue.get(date) || 0,
          ),
          color: "#15803d",
        },
      ],
      legend: { enabled: false },
      credits: { enabled: false },
      accessibility: { enabled: false },
    }),
    [analytics.dateKeys, analytics.dailyRevenue],
  );

  const topProductsOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        height: 280,
        backgroundColor: "transparent",
        spacing: [4, 8, 4, 4],
      },
      title: { text: undefined },
      xAxis: {
        categories: analytics.topProducts.map((product) => product.name),
        lineColor: "#e5e7eb",
        labels: { style: { color: "#4b5563" } },
      },
      yAxis: {
        title: { text: "Units ordered" },
        min: 0,
        allowDecimals: false,
        gridLineColor: "#f1f5f9",
      },
      plotOptions: {
        series: {
          color: "#0f766e",
          borderRadius: 3,
          dataLabels: { enabled: true },
        },
      },
      series: [
        {
          name: "Units",
          data: analytics.topProducts.map((product) => product.units),
        },
      ],
      legend: { enabled: false },
      credits: { enabled: false },
      accessibility: { enabled: false },
    }),
    [analytics.topProducts],
  );

  const inventoryOptions = useMemo(
    () => ({
      chart: {
        type: "column",
        height: 280,
        backgroundColor: "transparent",
        spacing: [4, 8, 4, 8],
      },
      title: { text: undefined },
      xAxis: {
        categories: ["Available", "Low stock", "Sold out"],
        lineColor: "#e5e7eb",
      },
      yAxis: {
        title: { text: "Products" },
        min: 0,
        allowDecimals: false,
        gridLineColor: "#f1f5f9",
      },
      plotOptions: {
        column: { borderRadius: 3, dataLabels: { enabled: true } },
      },
      series: [
        {
          name: "Products",
          data: [
            { y: analytics.inventory.available, color: "#15803d" },
            { y: analytics.inventory.lowStock, color: "#d97706" },
            { y: analytics.inventory.soldOut, color: "#dc2626" },
          ],
        },
      ],
      legend: { enabled: false },
      credits: { enabled: false },
      accessibility: { enabled: false },
    }),
    [analytics.inventory],
  );

  if (ordersLoading || productsLoading) {
    return (
      <div className="space-y-6" aria-label="Loading seller dashboard">
        <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Seller dashboard unavailable
        </h1>
        <p className="mt-2 text-sm text-red-700">
          {error.response?.data?.message || error.message}
        </p>
        <button
          type="button"
          onClick={() => {
            refetchOrders();
            refetchProducts();
          }}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Marketplace overview
          </p>
          <h1 className="mt-1 text-2xl font-bold font-serif text-gray-900">
            Seller Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Orders, revenue, product demand, and inventory at a glance.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/seller/orders"
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View orders
          </Link>
          <Link
            to="/seller/products"
            className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Manage products
          </Link>
        </div>
      </header>

      <p className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-900">
        These figures use marketplace-wide orders and public products; the
        current data model does not assign products or orders to individual
        sellers.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Metric
          label="Registered users"
          value={
            userCountLoading
              ? "..."
              : userCountError
                ? "—"
                : (userCountData?.data?.totalUsers ?? 0).toLocaleString()
          }
          detail={
            userCountError ? "Could not load user count" : "Non-admin accounts"
          }
          tone="slate"
        />
        <Metric
          label="Orders"
          value={orders.length.toLocaleString()}
          detail="All recorded orders"
          tone="blue"
        />
        <Metric
          label="Awaiting approval"
          value={analytics.awaitingApproval.toLocaleString()}
          detail="Pending seller action"
          tone="amber"
        />
        <Metric
          label="Completed revenue"
          value={`Rs ${analytics.revenue.toLocaleString()}`}
          detail={`${analytics.completedOrders} paid or delivered orders`}
          tone="green"
        />
        <Metric
          label="Available products"
          value={products.length.toLocaleString()}
          detail="Public products in the catalog"
          tone="slate"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartPanel title="Order status">
          {orders.length ? (
            <HighchartsReact highcharts={Highcharts} options={statusOptions} />
          ) : (
            <p className="flex h-[280px] items-center justify-center text-sm text-gray-500">
              Order activity will appear here.
            </p>
          )}
        </ChartPanel>
        <ChartPanel title="Completed revenue · last 14 days">
          {analytics.completedOrders ? (
            <HighchartsReact highcharts={Highcharts} options={revenueOptions} />
          ) : (
            <p className="flex h-[280px] items-center justify-center text-sm text-gray-500">
              Revenue appears after an order is paid or delivered.
            </p>
          )}
        </ChartPanel>
        <ChartPanel title="Most ordered products">
          {analytics.topProducts.length ? (
            <HighchartsReact
              highcharts={Highcharts}
              options={topProductsOptions}
            />
          ) : (
            <p className="flex h-[280px] items-center justify-center text-sm text-gray-500">
              Product demand will appear after orders arrive.
            </p>
          )}
        </ChartPanel>
        <ChartPanel title="Catalog inventory">
          {products.length ? (
            <HighchartsReact
              highcharts={Highcharts}
              options={inventoryOptions}
            />
          ) : (
            <p className="flex h-[280px] items-center justify-center text-sm text-gray-500">
              Create products to see inventory levels.
            </p>
          )}
        </ChartPanel>
      </div>
    </div>
  );
}
