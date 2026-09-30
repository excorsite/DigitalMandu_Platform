import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useVerifyPayment } from "../../api/hooks";

export default function KhaltiSuccess() {
  const [searchParams] = useSearchParams();
  const pidx = searchParams.get("pidx");
  const startedPidx = useRef(null);
  const {
    mutate: verifyPayment,
    data: verificationResponse,
    isPending,
    isError,
    error,
  } = useVerifyPayment();

  useEffect(() => {
    if (!pidx || startedPidx.current === pidx) return;
    startedPidx.current = pidx;
    verifyPayment({ pidx });
  }, [pidx, verifyPayment]);

  const verification = verificationResponse?.data;
  const order = verification?.order;
  const isPaid = verification?.paymentStatus === "paid";
  const isWaiting = verification?.paymentStatus === "pending";
  const title = isPaid
    ? "Payment successful"
    : isWaiting
      ? "Payment is still processing"
      : "Payment could not be confirmed";

  return (
    <main className="mx-auto max-w-2xl py-10 sm:py-16">
      <section className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-9">
        <div
          className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold ${isPaid ? "bg-emerald-100 text-emerald-800" : isWaiting || isPending ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}
          aria-hidden="true"
        >
          {isPaid ? "OK" : isWaiting || isPending ? "..." : "!"}
        </div>
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
          Khalti sandbox payment
        </p>
        <h1 className="mt-2 text-2xl font-bold font-serif text-gray-900">
          {isPending ? "Verifying your payment" : title}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-600">
          {isPending
            ? "We are checking the payment with Khalti. Please keep this page open."
            : isPaid
              ? "Your payment has been confirmed and your order is recorded."
              : isWaiting
                ? "Khalti has not confirmed the payment yet. You can check again shortly or review your orders."
                : isError
                  ? error?.response?.data?.message ||
                    "We could not verify this payment. Your order has not been marked as paid."
                  : !pidx
                    ? "The payment return did not include a reference, so this order cannot be marked as paid."
                    : "The payment could not be verified. Your order has not been marked as paid."}
        </p>

        {order && (
          <dl className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-x-5 gap-y-3 rounded-lg bg-gray-50 p-4 text-left text-sm">
            <dt className="text-gray-500">Order</dt>
            <dd className="text-right font-medium text-gray-900">
              #{String(order.id).slice(-8)}
            </dd>
            <dt className="text-gray-500">Amount</dt>
            <dd className="text-right font-semibold text-gray-900">
              Rs {Number(order.totalAmount || 0).toLocaleString()}
            </dd>
            <dt className="text-gray-500">Payment status</dt>
            <dd
              className={`text-right font-semibold ${isPaid ? "text-emerald-700" : "text-amber-700"}`}
            >
              {isPaid
                ? "Paid successfully"
                : isWaiting || isPending
                  ? "Pending confirmation"
                  : "Not confirmed"}
            </dd>
          </dl>
        )}

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {(isError || isWaiting) && pidx && (
            <button
              type="button"
              onClick={() => verifyPayment({ pidx })}
              disabled={isPending}
              className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Check payment again
            </button>
          )}
          <Link
            to="/orders"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            View my orders
          </Link>
          {!isPaid && (
            <Link
              to="/cart"
              className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Return to cart
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
