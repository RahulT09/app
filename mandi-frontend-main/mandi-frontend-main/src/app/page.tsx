import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { backendJson } from "@/lib/backend";
import { getServerUser } from "@/lib/session";
import { ProductCard } from "@/components/ProductCard";
import { LinkButton } from "@/components/ui/Button";
import type { ApiResponse, Category, Product } from "@/lib/types";

export const revalidate = 0;

async function getHomeData() {
  const [categoriesRes, productsRes] = await Promise.all([
    backendJson<ApiResponse<Category[]>>("/api/categories"),
    backendJson<ApiResponse<Product[]>>("/api/products?limit=8&sort=oldest"),
  ]);

  return {
    categories: categoriesRes.body?.data ?? [],
    products: productsRes.body?.data ?? [],
  };
}

export default async function HomePage() {
  const [{ categories, products }, user] = await Promise.all([
    getHomeData(),
    getServerUser(),
  ]);

  return (
    <div>
      <section className="border-b border-line bg-ink text-paper">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <div>
            <span className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-marigold">
              Open every day, no middlemen markup
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Everyday goods,
              <br /> honest prices.
            </h1>
            <p className="mt-5 max-w-md text-base text-paper/70">
              Mandi sources what you actually need — no inflated &ldquo;deals,&rdquo;
              just the real price on the tag, delivered across India.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
                            <LinkButton href="/products" variant="accent" size="lg">
                Shop all products <ArrowRight className="h-4 w-4" />
              </LinkButton>
              {user ? (
                <LinkButton
                  href={user.role === "ADMIN" ? "/admin" : "/orders"}
                  variant="outline"
                  size="lg"
                  className="border-paper/30 text-paper hover:bg-paper hover:text-ink"
                >
                  {user.role === "ADMIN" ? "Go to admin dashboard" : "View your orders"}
                </LinkButton>
              ) : (
                <LinkButton href="/register" variant="outline" size="lg" className="border-paper/30 text-paper hover:bg-paper hover:text-ink">
                  Create an account
                </LinkButton>
              )}
            </div>
          </div>
          <div className="hidden lg:block" aria-hidden>
            <div className="ml-auto flex max-w-sm flex-col gap-4">
              <div className="price-tag self-end bg-marigold px-6 py-3 font-mono text-2xl font-bold text-ink">
                ₹ fair, always
              </div>
              <div className="price-tag self-start bg-paper px-6 py-3 font-mono text-lg text-ink">
                no hidden fees
              </div>
              <div className="price-tag self-end bg-forest px-6 py-3 font-mono text-lg text-paper">
                shipped nationwide
              </div>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
            Shop by category
          </h2>
          <div className="mt-4 flex gap-3 overflow-x-auto scrollbar-none pb-2">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/products?category=${cat._id}`}
                className="shrink-0 rounded-full border border-line bg-white px-4 py-2 font-display text-sm font-medium text-ink hover:border-ink"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
            Newly listed
          </h2>
          <Link href="/products" className="text-sm font-medium text-forest hover:underline">
            View all
          </Link>
        </div>
        {products.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink/50">
            No products yet — check back soon, or add some from the admin dashboard.
          </p>
        )}
      </section>
    </div>
  );
}
