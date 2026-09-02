"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";
import { PayButton } from "@/components/PayButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api-client";
import { formatDateTime, formatPrice, getDeliveryEstimate } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null | "not-found">(null);
  const [cancelling, setCancelling] = useState(false);
  const { show } = useToast();
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      const data = await api.get<Order>(`/orders/${id}`);
      setOrder(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(`/login?next=/orders/${id}`);
        return;
      }
      setOrder("not-found");
    }
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCancel() {
    if (!confirm("Cancel this order? This can't be undone.")) return;
    setCancelling(true);
    try {
      await api.post(`/orders/${id}/cancel`);
      show("Order cancelled");
      load();
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't cancel order", "error");
    } finally {
      setCancelling(false);
    }
  }

  if (order === null) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-ink/50">Loading…</div>;
  }

  if (order === "not-found") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <EmptyState icon={Package} title="Order not found" description="This order doesn't exist or isn't yours." />
      </div>
    );
  }

  const canCancel = order.status === "PENDING";
  const needsPayment = order.status === "PENDING" && order.paymentStatus !== "PAID";
  const showEstimate = order.status === "PENDING" || order.status === "CONFIRMED";
  const address = order.shippingAddress;

  const orderUrl = typeof window !== "undefined"
    ? `${window.location.origin}/orders/${order._id}`
    : "";
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(orderUrl)}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-mono text-lg font-bold text-ink">
                #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="mt-1 text-sm text-ink/50">Placed {formatDateTime(order.createdAt)}</p>
            </div>
            <div className="flex gap-1.5">
              <Badge status={order.status} />
              <Badge status={order.paymentStatus} />
            </div>
          </div>

          {needsPayment && (
            <div className="mt-6 rounded-sm border border-marigold/40 bg-marigold/10 p-4">
              <p className="text-sm font-medium text-ink">Payment pending</p>
              <p className="mt-1 text-sm text-ink/60">Complete payment to confirm this order.</p>
              <div className="mt-3">
                <PayButton order={order} contactName={address.fullName} contactPhone={address.phoneNumber} onPaid={load} />
              </div>
            </div>
          )}
        </div>

        {orderUrl && (
          <section className="flex shrink-0 flex-col items-center rounded-sm border border-line bg-white p-4">
            <img src={qrSrc} alt="QR code linking to this order" width={160} height={160} className="rounded-sm border border-line" />
            <p className="mt-3 text-xs text-ink/60">Scan to view this order</p>
          </section>
        )}
      </div>

      <section className="mt-6 rounded-sm border border-line bg-white">
        <ul className="divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.product} className="flex justify-between px-4 py-3 text-sm">
              <span className="text-ink/80">
                {item.name} × {item.quantity}
              </span>
              <span className="font-mono">{formatPrice(item.subtotal)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-line px-4 py-3">
          <span className="text-sm font-medium text-ink">Total</span>
          <PriceTag amount={order.totalAmount} size="sm" tone="light" />
        </div>
      </section>

      <section className="mt-6 rounded-sm border border-line bg-white p-4">
        <h2 className="font-display text-xs font-semibold uppercase tracking-wide text-ink/50">
          Shipping to
        </h2>
        <p className="mt-2 text-sm font-medium text-ink">{address.fullName}</p>
        <p className="mt-0.5 text-sm text-ink/60">
          {address.addressLine}, {address.city}, {address.state} {address.postalCode}, {address.country}
        </p>
        <p className="mt-0.5 font-mono text-xs text-ink/50">{address.phoneNumber}</p>
        {showEstimate && (
          <div className="mt-4 border-t border-line pt-3">
            <p className="text-xs text-ink/60">
              Estimated delivery: {getDeliveryEstimate(address.state)}
            </p>
          </div>
        )}
      </section>

      {canCancel && (
        <Button variant="outline" className="mt-6 w-full" disabled={cancelling} onClick={handleCancel}>
          {cancelling ? "Cancelling…" : "Cancel order"}
        </Button>
      )}
    </div>
  );
}
