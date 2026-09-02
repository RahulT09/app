"use client";

import { use, useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { PriceTag } from "@/components/ui/PriceTag";
import { Select } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api-client";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";
import { ClipboardList } from "lucide-react";

const NEXT_STATUS_OPTIONS: OrderStatus[] = ["CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null | "not-found">(null);
  const [updating, setUpdating] = useState(false);
  const { show } = useToast();

  const load = useCallback(async () => {
    try {
      // Admins fetch through the all-orders endpoint and pick theirs out,
      // since there's no single-order admin lookup route.
      const data = await api.get<Order[]>(`/orders/admin/all?limit=50`);
      const found = data.find((o) => o._id === id) ?? null;
      setOrder(found ?? "not-found");
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't load order", "error");
      setOrder("not-found");
    }
  }, [id, show]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(status: OrderStatus) {
    setUpdating(true);
    try {
      await api.patch(`/orders/${id}/status`, { status });
      show(`Order marked ${status.toLowerCase()}`);
      load();
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't update status", "error");
    } finally {
      setUpdating(false);
    }
  }

  if (order === null) {
    return <p className="text-sm text-ink/50">Loading…</p>;
  }
  if (order === "not-found") {
    return <EmptyState icon={ClipboardList} title="Order not found" />;
  }

  const terminal = order.status === "DELIVERED" || order.status === "CANCELLED";
  const customer = typeof order.user === "object" ? order.user : null;
  const address = order.shippingAddress;

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-mono text-lg font-bold text-ink">#{order._id.slice(-8).toUpperCase()}</h1>
          <p className="mt-1 text-sm text-ink/50">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex gap-1.5">
          <Badge status={order.status} />
          <Badge status={order.paymentStatus} />
        </div>
      </div>

      {customer && (
        <p className="mt-3 text-sm text-ink/70">
          {customer.name} · {customer.email}
        </p>
      )}

      <div className="mt-5 flex items-center gap-3 rounded-sm border border-line bg-white p-4">
        <span className="text-sm font-medium text-ink">Update status</span>
        <Select
          aria-label="Update status"
          value=""
          disabled={terminal || updating}
          onChange={(e) => e.target.value && updateStatus(e.target.value as OrderStatus)}
          className="h-9 w-40"
        >
          <option value="">{terminal ? "Final state" : "Choose…"}</option>
          {NEXT_STATUS_OPTIONS.filter((s) => s !== order.status).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <section className="mt-6 rounded-sm border border-line bg-white">
        <ul className="divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.product} className="flex justify-between px-4 py-3 text-sm">
              <span className="text-ink/80">{item.name} × {item.quantity}</span>
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
        <h2 className="font-display text-xs font-semibold uppercase tracking-wide text-ink/50">Shipping to</h2>
        <p className="mt-2 text-sm font-medium text-ink">{address.fullName}</p>
        <p className="mt-0.5 text-sm text-ink/60">
          {address.addressLine}, {address.city}, {address.state} {address.postalCode}, {address.country}
        </p>
        <p className="mt-0.5 font-mono text-xs text-ink/50">{address.phoneNumber}</p>
      </section>
    </div>
  );
}
