"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, Heart, PackageX, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api-client";
import type { Product, Cart } from "@/lib/types";

// Deterministic badges & ratings for nice visual match
function getProductMeta(product: Product) {
  const name = product.name.toLowerCase();
  if (name.includes("mascara")) {
    return { badge: "Best Seller", rating: 4.6, reviews: "12.4K" };
  }
  if (name.includes("eyeshadow")) {
    return { badge: "Trending", rating: 4.5, reviews: "8.1K" };
  }
  if (name.includes("powder")) {
    return { badge: "Popular", rating: 4.4, reviews: "6.2K" };
  }
  if (name.includes("lipstick")) {
    return { badge: null, rating: 4.3, reviews: "9.7K" };
  }
  if (name.includes("nail polish")) {
    return { badge: "Trending", rating: 4.7, reviews: "5.3K" };
  }
  if (name.includes("ck one") || name.includes("perfume") || name.includes("dior") || name.includes("chanel")) {
    return { badge: "Best Seller", rating: 4.8, reviews: "18.2K" };
  }

  // Fallback hash
  const hash = product._id ? product._id.charCodeAt(product._id.length - 1) : 5;
  const ratings = [4.4, 4.5, 4.6, 4.7, 4.8];
  const reviews = ["3.4K", "5.1K", "8.9K", "11.2K", "14.5K"];
  return {
    badge: hash % 3 === 0 ? "Popular" : hash % 3 === 1 ? "Trending" : null,
    rating: ratings[hash % ratings.length],
    reviews: reviews[hash % reviews.length],
  };
}

export function ProductCard({ product }: { product: Product }) {
  const [adding, setAdding] = useState(false);
  const [liked, setLiked] = useState(false);
  const { refresh } = useCart();
  const { show } = useToast();
  const router = useRouter();

  const meta = getProductMeta(product);
  const outOfStock = product.stock <= 0;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (outOfStock) return;

    setAdding(true);
    try {
      await api.post<Cart>("/cart/items", {
        productId: product._id,
        quantity: 1,
      });
      await refresh();
      show(`Added ${product.name} to cart`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(`/login?next=/products/${product._id}`);
        return;
      }
      show(err instanceof ApiError ? err.message : "Couldn't add to cart", "error");
    } finally {
      setAdding(false);
    }
  }

  function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
    show(liked ? "Removed from wishlist" : "Added to wishlist");
  }

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-[#EBE7DE] bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)]">
      
      {/* Top Bar: Badge & Wishlist Heart */}
      <div className="flex items-center justify-between gap-2 h-6">
        {meta.badge ? (
          <span className="rounded-full bg-[#F5C344] px-2.5 py-0.5 text-[11px] font-bold text-[#2C2405] shadow-xs">
            {meta.badge}
          </span>
        ) : (
          <span />
        )}
        <button
          onClick={handleLike}
          className="ml-auto rounded-full p-1 text-gray-600 hover:text-red-500 transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              liked ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>
      </div>

      {/* Product Image Link */}
      <Link href={`/products/${product._id}`} className="block my-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#FAF8F5] flex items-center justify-center p-3">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <PackageX className="h-10 w-10" strokeWidth={1.5} />
            </div>
          )}
          {outOfStock && (
            <span className="absolute left-2 top-2 rounded-full bg-black/80 px-2.5 py-0.5 text-[10px] font-semibold text-white">
              Out of stock
            </span>
          )}
        </div>
      </Link>

      {/* Product Title & Info */}
      <div className="flex flex-col gap-1.5 pt-1">
        <Link href={`/products/${product._id}`}>
          <h3 className="line-clamp-1 text-xs sm:text-sm font-semibold text-gray-900 hover:text-[#22382B] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating Row */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="flex items-center gap-0.5 font-bold text-gray-800">
            <Star className="h-3.5 w-3.5 fill-[#EAA228] text-[#EAA228]" />
            <span>{meta.rating}</span>
          </div>
          <span className="text-gray-400">({meta.reviews})</span>
        </div>

        {/* Price Row */}
        <div className="my-1">
          <span className="text-base font-extrabold text-[#141E18]">
            ₹{product.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={adding || outOfStock}
          className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#18261F] py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#263C31] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          {adding ? "Adding..." : outOfStock ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
