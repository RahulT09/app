"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { Category } from "@/lib/types";

interface Params {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
}

export function ProductFilters({
  categories,
  params,
}: {
  categories: Category[];
  params: Params;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [minPrice, setMinPrice] = useState(params.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(params.maxPrice ?? "");

  function updateParam(key: string, value: string) {
    const qs = new URLSearchParams(params as Record<string, string>);
    if (value) qs.set(key, value);
    else qs.delete(key);
    qs.delete("page");
    router.push(`${pathname}?${qs.toString()}`);
  }

  function applyPriceRange() {
    const qs = new URLSearchParams(params as Record<string, string>);
    if (minPrice) qs.set("minPrice", minPrice);
    else qs.delete("minPrice");
    if (maxPrice) qs.set("maxPrice", maxPrice);
    else qs.delete("maxPrice");
    qs.delete("page");
    router.push(`${pathname}?${qs.toString()}`);
  }

  return (
    <aside className="flex flex-col gap-6">
      <Select
        label="Sort by"
        defaultValue={params.sort ?? ""}
        onChange={(e) => updateParam("sort", e.target.value)}
      >
        <option value="">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
        <option value="name_asc">Name: A to Z</option>
        <option value="name_desc">Name: Z to A</option>
      </Select>

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink">Category</p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => updateParam("category", "")}
            className={`rounded-sm px-2.5 py-1.5 text-left text-sm ${
              !params.category ? "bg-ink text-paper" : "hover:bg-ink/5"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => updateParam("category", c._id)}
              className={`rounded-sm px-2.5 py-1.5 text-left text-sm ${
                params.category === c._id ? "bg-ink text-paper" : "hover:bg-ink/5"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink">Price (₹)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-10 w-full min-w-0 rounded-sm border border-line px-2.5 text-sm outline-none focus:border-ink"
          />
          <span className="text-ink/40">–</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-10 w-full min-w-0 rounded-sm border border-line px-2.5 text-sm outline-none focus:border-ink"
          />
        </div>
        <Button variant="outline" size="sm" className="mt-2 w-full" onClick={applyPriceRange}>
          Apply
        </Button>
      </div>
    </aside>
  );
}
