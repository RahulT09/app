"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const { show } = useToast();

  useEffect(() => {
    api
      .get<Order[]>("/orders")
      .then(setOrders)
      .catch((err) => show(err instanceof ApiError ? err.message : "Couldn't load orders", "error"));
  }, [show]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-ink">Your orders</h1>

      {orders === null ? (
        <p className="mt-8 text-sm text-ink/50">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="Once you place an order, it'll show up here."
            action={<LinkButton href="/products">Start shopping</LinkButton>}
          />
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order._id}>
              <Link
                href={`/orders/${order._id}`}
                className="flex items-center justify-between gap-4 rounded-sm border border-line bg-white p-4 hover:border-ink"
              >
                <div>
                  <p className="font-mono text-sm text-ink">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="mt-1 text-xs text-ink/50">
                    {formatDate(order.createdAt)} · {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""}
                  </p>
                  <div className="mt-2 flex gap-1.5">
                    <Badge status={order.status} />
                    <Badge status={order.paymentStatus} />
                  </div>
                </div>
                <PriceTag amount={order.totalAmount} size="sm" tone="light" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
