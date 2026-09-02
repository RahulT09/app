"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { AddressForm } from "@/app/addresses/AddressForm";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";
import { PayButton } from "@/components/PayButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api-client";
import { formatPrice, getDeliveryEstimate } from "@/lib/format";
import type { Address, Order } from "@/lib/types";

export default function CheckoutPage() {
  const { cart, loading: cartLoading, refresh: refreshCart } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addrLoading, setAddrLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const { show } = useToast();
  const router = useRouter();

  const loadAddresses = useCallback(async () => {
    setAddrLoading(true);
    try {
      const data = await api.get<Address[]>("/addresses");
      setAddresses(data);
      const def = data.find((a) => a.isDefault) ?? data[0];
      if (def) setSelectedId(def._id);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login?next=/checkout");
        return;
      }
      show("Couldn't load addresses", "error");
    } finally {
      setAddrLoading(false);
    }
  }, [show, router]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const items = cart?.items ?? [];
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  async function handlePlaceOrder() {
    if (!selectedId) return;
    setPlacingOrder(true);
    try {
      const created = await api.post<Order>("/orders", { addressId: selectedId });
      setOrder(created);
      await refreshCart();
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't place order", "error");
    } finally {
      setPlacingOrder(false);
    }
  }

  const selectedAddress = addresses.find((a) => a._id === selectedId);

  if (cartLoading || addrLoading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-ink/50">Loading…</div>;
  }

  if (!order && items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <EmptyState icon={MapPin} title="Your cart is empty" description="Add products before checking out." />
      </div>
    );
  }

  // Order placed — show payment step
  if (order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-ink">Complete payment</h1>
        <div className="mt-6 rounded-sm border border-line bg-white p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink/60">Order</span>
            <span className="font-mono">#{order._id.slice(-8).toUpperCase()}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-ink/60">Amount due</span>
            <PriceTag amount={order.totalAmount} tone="light" />
          </div>
          <div className="mt-5">
            <PayButton
              order={order}
              contactName={selectedAddress?.fullName}
              contactPhone={selectedAddress?.phoneNumber}
              onPaid={() => router.push(`/orders/${order._id}`)}
            />
          </div>
          <p className="mt-3 text-center text-xs text-ink/40">
            Placed the order but not ready to pay? You can pay later from{" "}
            <button onClick={() => router.push(`/orders/${order._id}`)} className="underline">
              your orders
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-ink">Checkout</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink/60">
              Deliver to
            </h2>
            {!addingAddress && (
              <button onClick={() => setAddingAddress(true)} className="flex items-center gap-1 text-sm font-medium text-forest hover:underline">
                <Plus className="h-3.5 w-3.5" /> New address
              </button>
            )}
          </div>

          {addingAddress ? (
            <div className="mt-4">
              <AddressForm
                onSaved={() => {
                  setAddingAddress(false);
                  loadAddresses();
                }}
                onCancel={() => setAddingAddress(false)}
              />
            </div>
          ) : addresses.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="No addresses yet"
              description="Add a delivery address to continue."
              action={<Button onClick={() => setAddingAddress(true)}>Add address</Button>}
            />
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {addresses.map((addr) => (
                <li key={addr._id}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-sm border p-4 ${
                      selectedId === addr._id ? "border-ink" : "border-line"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      className="mt-1 accent-forest"
                      checked={selectedId === addr._id}
                      onChange={() => setSelectedId(addr._id)}
                    />
                    <div>
                      <p className="text-sm font-medium text-ink">{addr.fullName}</p>
                      <p className="mt-0.5 text-sm text-ink/60">
                        {addr.addressLine}, {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-ink/50">{addr.phoneNumber}</p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="h-fit rounded-sm border border-line bg-white p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink/60">
            Order summary
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.product._id} className="flex justify-between text-sm">
                <span className="text-ink/70">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-mono">{formatPrice(item.product.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="text-sm font-medium text-ink">Total</span>
            <PriceTag amount={total} tone="light" />
          </div>
          {selectedAddress && (
            <p className="mt-3 text-center text-xs text-ink/60">
              Estimated delivery: {getDeliveryEstimate(selectedAddress.state)}
            </p>
          )}
          <Button
            className="mt-5 w-full"
            disabled={!selectedId || placingOrder || addingAddress}
            onClick={handlePlaceOrder}
          >
            {placingOrder ? "Placing order…" : "Place order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
