import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Play,
  Truck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { backendJson } from "@/lib/backend";
import { getServerUser } from "@/lib/session";
import { HomeFeaturedSection } from "@/components/HomeFeaturedSection";
import type { ApiResponse, Category, Product } from "@/lib/types";

export const revalidate = 0;

async function getHomeData() {
  const [categoriesRes, productsRes] = await Promise.all([
    backendJson<ApiResponse<Category[]>>("/api/categories"),
    backendJson<ApiResponse<Product[]>>("/api/products?limit=16&sort=oldest"),
  ]);

  return {
    categories: categoriesRes.body?.data ?? [],
    products: productsRes.body?.data ?? [],
  };
}

// Category visual mapping matching the design mockup
const CATEGORY_ITEMS = [
  {
    name: "Beauty",
    image: "/categories/beauty.jpg",
    slug: "beauty",
    featured: true,
  },
  {
    name: "Fragrances",
    image: "/categories/fragrances.jpg",
    slug: "fragrances",
    featured: false,
  },
  {
    name: "Groceries",
    image: "/categories/groceries.jpg",
    slug: "groceries",
    featured: false,
  },
  {
    name: "Personal Care",
    image: "/categories/personal-care.jpg",
    slug: "personal-care",
    featured: false,
  },
  {
    name: "Home & Living",
    image: "/categories/home-living.jpg",
    slug: "furniture",
    featured: false,
  },
  {
    name: "Fashion",
    image: "/categories/fashion.jpg",
    slug: "fashion",
    featured: false,
  },
  {
    name: "Electronics",
    image: "/categories/electronics.jpg",
    slug: "electronics",
    featured: false,
  },
];

export default async function HomePage() {
  const [{ categories, products }] = await Promise.all([
    getHomeData(),
    getServerUser(),
  ]);

  return (
    <div className="bg-[#FAF8F5] text-[#141E18]">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-[#EBE7DF] bg-[#FAF8F5] py-10 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            
            {/* Left Content */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#736E62]">
                OPEN EVERY DAY, NO MIDDLEMEN MARKUP
              </span>

              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-[58px] font-extrabold tracking-tight text-[#141E18] leading-[1.06]">
                Everyday goods,
                <br />
                <span className="text-[#EAA228]">honest prices.</span>
              </h1>

              <p className="mt-5 max-w-lg text-sm sm:text-base text-[#575B58] leading-relaxed">
                Mandi sources what you actually need — no inflated &ldquo;deals,&rdquo;
                just the real price on the tag, delivered across India.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/products"
                  className="flex items-center gap-2 rounded-xl bg-[#EAA228] px-6 py-3.5 text-xs sm:text-sm font-bold text-[#141E18] shadow-sm transition-all hover:bg-[#DE9720] active:scale-[0.98]"
                >
                  Shop all products <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/products?category=beauty"
                  className="flex items-center gap-2 rounded-xl border border-[#DCD6C9] bg-white/80 px-5 py-3.5 text-xs sm:text-sm font-semibold text-[#141E18] backdrop-blur-xs transition-all hover:bg-white active:scale-[0.98]"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#141E18] text-white">
                    <Play className="h-2.5 w-2.5 fill-white" />
                  </span>
                  See how it works
                </Link>
              </div>

              {/* Value Props Row */}
              <div className="mt-12 grid grid-cols-1 gap-4 pt-4 border-t border-[#EAE5DB] sm:grid-cols-3">
                {/* Prop 1 */}
                <div className="flex items-start gap-3">
                  <div className="p-1 text-[#141E18]">
                    <Truck className="h-5 w-5 stroke-[1.75]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Pan India Shipping</h4>
                    <p className="text-[11px] text-gray-500">Delivered to 29,000+ pincodes</p>
                  </div>
                </div>

                {/* Prop 2 */}
                <div className="flex items-start gap-3">
                  <div className="p-1 text-[#141E18]">
                    <ShieldCheck className="h-5 w-5 stroke-[1.75]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Fair, Transparent Prices</h4>
                    <p className="text-[11px] text-gray-500">No hidden fees</p>
                  </div>
                </div>

                {/* Prop 3 */}
                <div className="flex items-start gap-3">
                  <div className="p-1 text-[#141E18]">
                    <Sparkles className="h-5 w-5 stroke-[1.75]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Everyday Essentials</h4>
                    <p className="text-[11px] text-gray-500">From groceries to beauty</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Image Composition */}
            <div className="lg:col-span-6 relative flex justify-center items-center">
              <div className="relative w-full overflow-hidden rounded-2xl border border-[#E8E2D6] bg-gradient-to-b from-[#F2EFE8] to-[#E9E4D9] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)]">
                
                {/* Hero Showcase Image */}
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src="/hero-products.jpg"
                    alt="Mandi curated everyday products"
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover object-bottom"
                  />
                </div>

                {/* Floating Top Right Tag */}
                <div className="absolute top-4 right-4 rounded-xl border border-white/80 bg-white/90 px-3.5 py-2.5 text-[11px] font-semibold text-gray-800 shadow-md backdrop-blur-md flex items-center gap-2">
                  <div className="leading-tight">
                    <p className="font-bold text-gray-900">Real Products.</p>
                    <p className="text-gray-600">Real Prices. Real People.</p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#EAA228]" />
                </div>

                {/* Floating Handwritten Style Label */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 -rotate-6 rounded-lg bg-white/70 px-2.5 py-1 text-xs font-serif italic text-gray-700 backdrop-blur-xs border border-white/50 shadow-xs">
                  ✨ Good Things Everyday
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SHOP BY CATEGORY SECTION */}
      <section id="categories" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#141E18]">
            Shop by Category
          </h2>
          <Link
            href="/products"
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-700 hover:text-black transition-colors"
          >
            View all categories <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Categories Card Row */}
        <div className="flex gap-3.5 overflow-x-auto pb-4 scrollbar-none">
          {CATEGORY_ITEMS.map((cat) => {
            const dbCat = categories.find(
              (c) => c.name.toLowerCase() === cat.slug.toLowerCase()
            );
            const href = dbCat
              ? `/products?category=${dbCat._id}`
              : `/products?search=${cat.slug}`;

            return (
              <Link
                key={cat.name}
                href={href}
                className={`group flex min-w-[150px] shrink-0 items-center justify-between rounded-2xl border p-2.5 sm:p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  cat.featured
                    ? "border-[#E8E2D5] bg-[#F4F1EB] hover:bg-[#EDE8DE]"
                    : "border-[#EDE8DE] bg-[#F7F5F0] hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white border border-[#E8E4DB] flex items-center justify-center p-1">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="48px"
                      className="object-contain p-1 transition-transform duration-200 group-hover:scale-110"
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-900">
                    {cat.name}
                  </span>
                </div>

                {cat.featured && (
                  <span className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EAA228] text-black shadow-xs transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <HomeFeaturedSection products={products} />

    </div>
  );
}
