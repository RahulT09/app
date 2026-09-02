"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, PackageX } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { PriceTag } from "@/components/ui/PriceTag";
import { LinkButton, Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";
import type { Cart } from "@/lib/types";

export default function CartPage() {
  const { cart, loading, refresh } = useCart();
  const { show } = useToast();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function updateQuantity(productId: string, quantity: number, stock: number) {
    if (quantity < 1 || quantity > stock) return;
    setBusyId(productId);
    try {
      await api.patch<Cart>(`/cart/items/${productId}`, { quantity });
      await refresh();
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't update quantity", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem(productId: string) {
    setBusyId(productId);
    try {
      await api.del<Cart>(`/cart/items/${productId}`);
      await refresh();
      show("Removed from cart");
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't remove item", "error");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-ink/50">
        Loading your cart…
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add something you need — it'll show up here."
          action={<LinkButton href="/products">Start shopping</LinkButton>}
        />
      </div>
    );
  }

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const hasOutOfStock = items.some((item) => item.quantity > item.product.stock);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-ink">Your cart</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {items.map((item) => {
            const overStock = item.quantity > item.product.stock;
            return (
              <li key={item.product._id} className="flex gap-4 py-5">
                <Link
                  href={`/products/${item.product._id}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-line bg-white"
                >
                  {item.product.images?.[0] ? (
                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink/20">
                      <PackageX className="h-6 w-6" strokeWidth={1.5} />
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link href={`/products/${item.product._id}`} className="text-sm font-medium text-ink hover:underline">
                      {item.product.name}
                    </Link>
                    <p className="mt-1 font-mono text-xs text-ink/50">{formatPrice(item.product.price)} each</p>
                    {overStock && (
                      <p className="mt-1 text-xs font-medium text-brick">
                        Only {item.product.stock} left — reduce quantity
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-sm border border-line">
                      <button
                        disabled={busyId === item.product._id}
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.product.stock)}
                        className="flex h-9 w-9 items-center justify-center hover:bg-ink/5 disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center font-mono text-sm">{item.quantity}</span>
                      <button
                        disabled={busyId === item.product._id || item.quantity >= item.product.stock}
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.product.stock)}
                        className="flex h-9 w-9 items-center justify-center hover:bg-ink/5 disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      disabled={busyId === item.product._id}
                      onClick={() => removeItem(item.product._id)}
                      className="text-ink/40 hover:text-brick disabled:opacity-40"
                      aria-label={`Remove ${item.product.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="h-fit rounded-sm border border-line bg-white p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink/60">Order summary</h2>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-ink/70">Subtotal</span>
            <PriceTag amount={total} size="md" tone="light" />
          </div>
          <p className="mt-2 text-xs text-ink/50">Shipping calculated at checkout.</p>
          <Button
            className="mt-5 w-full"
            disabled={hasOutOfStock}
            onClick={() => router.push("/checkout")}
          >
            Checkout
          </Button>
          {hasOutOfStock && (
            <p className="mt-2 text-xs text-brick">Fix quantities above stock before checking out.</p>
          )}
        </div>
      </div>
    </div>
  );
}
