"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, PackageX, Pencil, Search } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const { show } = useToast();

  const load = useCallback(async () => {
    setProducts(null);
    const qs = new URLSearchParams({ limit: "50" });
    if (search) qs.set("search", search);
    if (status) qs.set("status", status);
    try {
      const data = await api.get<Product[]>(`/products/admin/all?${qs.toString()}`);
      setProducts(data);
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't load products", "error");
    }
  }, [search, status, show]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleActive(product: Product) {
    try {
      await api.patch(`/products/${product._id}`, { isActive: !product.isActive });
      show(product.isActive ? "Product deactivated" : "Product reactivated");
      load();
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't update product", "error");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-ink">Products</h1>
        <LinkButton href="/admin/products/new" size="sm">
          <Plus className="h-4 w-4" /> New product
        </LinkButton>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products"
            className="h-10 w-full rounded-sm border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-ink"
          />
        </div>
        <div className="flex gap-1">
          {(["", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-sm border px-3 py-2 text-sm font-medium ${
                status === s ? "border-ink bg-ink text-paper" : "border-line text-ink/70"
              }`}
            >
              {s === "" ? "All" : s === "active" ? "Active" : "Inactive"}
            </button>
          ))}
        </div>
      </div>

      {products === null ? (
        <p className="mt-8 text-sm text-ink/50">Loading…</p>
      ) : products.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={PackageX} title="No products found" />
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-sm border border-line bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/50">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border border-line bg-paper">
                        {p.images?.[0] ? (
                          <Image src={p.images[0]} alt="" fill className="object-cover" />
                        ) : (
                          <PackageX className="m-auto h-4 w-4 text-ink/20" />
                        )}
                      </div>
                      <span className="max-w-[220px] truncate font-medium text-ink">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink/60">
                    {typeof p.category === "object" ? p.category.name : "—"}
                  </td>
                  <td className="px-4 py-3 font-mono">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 font-mono">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.isActive ? "bg-forest/10 text-forest" : "bg-ink/10 text-ink/50"
                      }`}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/products/${p._id}/edit`}
                        className="flex h-8 w-8 items-center justify-center rounded-sm text-ink/50 hover:bg-ink/5 hover:text-ink"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(p)}>
                        {p.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
