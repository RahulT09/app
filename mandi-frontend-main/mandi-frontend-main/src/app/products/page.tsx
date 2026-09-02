import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { backendJson } from "@/lib/backend";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductFilters } from "@/app/products/ProductFilters";
import type { ApiResponse, Category, Pagination, Product } from "@/lib/types";

export const revalidate = 0;

interface SearchParams {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
}

async function getData(params: SearchParams) {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.category) qs.set("category", params.category);
  if (params.minPrice) qs.set("minPrice", params.minPrice);
  if (params.maxPrice) qs.set("maxPrice", params.maxPrice);
  if (params.sort) qs.set("sort", params.sort);
  if (params.page) qs.set("page", params.page);

  const [productsRes, categoriesRes] = await Promise.all([
    backendJson<ApiResponse<Product[]>>(`/api/products?${qs.toString()}`),
    backendJson<ApiResponse<Category[]>>("/api/categories"),
  ]);

  return {
    products: productsRes.body?.data ?? [],
    pagination: productsRes.body?.pagination as Pagination | undefined,
    categories: categoriesRes.body?.data ?? [],
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { products, pagination, categories } = await getData(params);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold text-ink">
          {params.search ? `Results for "${params.search}"` : "All products"}
        </h1>
        {pagination && (
          <p className="text-sm text-ink/50">{pagination.totalProducts} products</p>
        )}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
        <ProductFilters categories={categories} params={params} />

        <div>
          {products.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No products found"
              description="Try a different search term or clear your filters."
              action={
                <Link href="/products" className="text-sm font-medium text-forest hover:underline">
                  Clear all filters
                </Link>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((n) => {
                    const qs = new URLSearchParams(params as Record<string, string>);
                    qs.set("page", String(n));
                    const active = n === pagination.page;
                    return (
                      <Link
                        key={n}
                        href={`/products?${qs.toString()}`}
                        aria-current={active ? "page" : undefined}
                        className={`flex h-9 w-9 items-center justify-center rounded-sm font-mono text-sm ${
                          active ? "bg-ink text-paper" : "border border-line text-ink hover:border-ink"
                        }`}
                      >
                        {n}
                      </Link>
                    );
                  })}
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
