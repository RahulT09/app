"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api-client";
import { formatDate, formatPrice } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
const NEXT_STATUS_OPTIONS: OrderStatus[] = ["CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

function AdminOrdersContent() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { show } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusFilter = searchParams.get("status") ?? "";

  const load = useCallback(async () => {
    setOrders(null);
    const qs = new URLSearchParams({ limit: "50" });
    if (statusFilter) qs.set("status", statusFilter);
    try {
      const data = await api.get<Order[]>(`/orders/admin/all?${qs.toString()}`);
      setOrders(data);
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't load orders", "error");
    }
  }, [statusFilter, show]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      show(`Order marked ${status.toLowerCase()}`);
      load();
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't update status", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Orders</h1>

      <div className="mt-5 flex flex-wrap gap-1">
        <button
          onClick={() => router.push("/admin/orders")}
          className={`rounded-sm border px-3 py-1.5 text-sm font-medium ${
            !statusFilter ? "border-ink bg-ink text-paper" : "border-line text-ink/70"
          }`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => router.push(`/admin/orders?status=${s}`)}
            className={`rounded-sm border px-3 py-1.5 text-sm font-medium ${
              statusFilter === s ? "border-ink bg-ink text-paper" : "border-line text-ink/70"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {orders === null ? (
        <p className="mt-8 text-sm text-ink/50">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={ClipboardList} title="No orders found" />
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-sm border border-line bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/50">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => {
                const customer = typeof order.user === "object" ? order.user : null;
                const terminal = order.status === "DELIVERED" || order.status === "CANCELLED";
                return (
                  <tr key={order._id}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order._id}`} className="font-mono text-xs hover:underline">
                        #{order._id.slice(-8).toUpperCase()}
                      </Link>
                      <p className="mt-0.5 text-xs text-ink/40">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3 text-ink/70">
                      {customer ? (
                        <>
                          <p>{customer.name}</p>
                          <p className="text-xs text-ink/40">{customer.email}</p>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono">{formatPrice(order.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <Badge status={order.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        aria-label="Update status"
                        value=""
                        disabled={terminal || updatingId === order._id}
                        onChange={(e) => {
                          if (e.target.value) updateStatus(order._id, e.target.value as OrderStatus);
                        }}
                        className="h-9 min-w-[140px] text-xs"
                      >
                        <option value="">{terminal ? "Final" : "Change to…"}</option>
                        {NEXT_STATUS_OPTIONS.filter((s) => s !== order.status).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <AdminOrdersContent />
    </Suspense>
  );
}
