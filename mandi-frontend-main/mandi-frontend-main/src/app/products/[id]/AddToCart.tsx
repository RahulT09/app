"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/components/CartProvider";
import { api, ApiError } from "@/lib/api-client";
import type { Cart } from "@/lib/types";

export function AddToCart({ productId, stock }: { productId: string; stock: number }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { show } = useToast();
  const { refresh } = useCart();
  const router = useRouter();

  const outOfStock = stock <= 0;

  async function handleAdd() {
    setLoading(true);
    try {
      await api.post<Cart>("/cart/items", { productId, quantity });
      await refresh();
      show("Added to cart");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(`/login?next=/products/${productId}`);
        return;
      }
      show(err instanceof ApiError ? err.message : "Couldn't add to cart", "error");
    } finally {
      setLoading(false);
    }
  }

  if (outOfStock) {
    return (
      <Button variant="outline" size="lg" disabled className="w-full sm:w-auto">
        Out of stock
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-sm border border-line">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-11 w-11 items-center justify-center hover:bg-ink/5"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center font-mono text-sm" aria-live="polite">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
          className="flex h-11 w-11 items-center justify-center hover:bg-ink/5"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Button onClick={handleAdd} disabled={loading} size="lg" className="flex-1 sm:flex-initial">
        {loading ? "Adding…" : "Add to cart"}
      </Button>
    </div>
  );
}
