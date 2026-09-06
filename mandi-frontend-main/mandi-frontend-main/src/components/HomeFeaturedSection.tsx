"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

interface HomeFeaturedSectionProps {
  products: Product[];
}

const CATEGORIES = [
  { id: "all", name: "All" },
  { id: "beauty", name: "Beauty" },
  { id: "fragrances", name: "Fragrances" },
  { id: "personal-care", name: "Personal Care" },
  { id: "furniture", name: "Home & Living" },
];

export function HomeFeaturedSection({ products }: HomeFeaturedSectionProps) {
  const [selectedCat, setSelectedCat] = useState("all");

  // Priority order to match the reference mockup hero items
  const priorityNames = [
    "essence mascara lash princess",
    "eyeshadow palette with mirror",
    "powder canister",
    "red lipstick",
    "red nail polish",
    "calvin klein ck one",
  ];

  const sortedProducts = [...products].sort((a, b) => {
    const aIndex = priorityNames.findIndex((name) =>
      a.name.toLowerCase().includes(name)
    );
    const bIndex = priorityNames.findIndex((name) =>
      b.name.toLowerCase().includes(name)
    );

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });

  const filteredProducts = sortedProducts.filter((p) => {
    if (selectedCat === "all") return true;
    const catName = typeof p.category === "object" ? p.category.name : p.category;
    if (!catName) return true;
    const lower = catName.toLowerCase();
    if (selectedCat === "furniture") return lower.includes("furniture") || lower.includes("home");
    if (selectedCat === "personal-care") return lower.includes("beauty") || lower.includes("personal");
    return lower.includes(selectedCat);
  });

  const displayProducts = (filteredProducts.length > 0 ? filteredProducts : sortedProducts).slice(0, 8);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Row: Title & Subtitle + Category Filter Pills */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[#EDE8DE] pb-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#141E18]">
            Featured Products
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Curated for your everyday essentials
          </p>
        </div>

        {/* Filter Pills & View All */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                selectedCat === cat.id
                  ? "bg-[#18261F] text-white shadow-xs"
                  : "bg-white border border-[#E2DDD3] text-gray-700 hover:bg-[#F5F2EC]"
              }`}
            >
              {cat.name}
            </button>
          ))}

          <Link
            href="/products"
            className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-black transition-colors pl-2"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {displayProducts.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}
