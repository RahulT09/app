import { notFound } from "next/navigation";
import Image from "next/image";
import { PackageX } from "lucide-react";
import { backendJson } from "@/lib/backend";
import { PriceTag } from "@/components/ui/PriceTag";
import { AddToCart } from "@/app/products/[id]/AddToCart";
import type { ApiResponse, Product } from "@/lib/types";

export const revalidate = 0;

async function getProduct(id: string) {
  const res = await backendJson<ApiResponse<Product>>(`/api/products/${id}`);
  if (res.status !== 200 || !res.body?.data) return null;
  return res.body.data;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const categoryName =
    typeof product.category === "object" ? product.category.name : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-sm border border-line bg-white">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              priority
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink/20">
              <PackageX className="h-14 w-14" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div>
          {categoryName && (
            <span className="font-display text-xs font-semibold uppercase tracking-wider text-forest">
              {categoryName}
            </span>
          )}
          <h1 className="mt-2 font-display text-3xl font-bold text-ink">{product.name}</h1>

          <div className="mt-4">
            <PriceTag amount={product.price} size="lg" />
          </div>

          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-ink/70">
            {product.description}
          </p>

          <div className="mt-6 text-sm">
            {product.stock > 0 ? (
              <span className="font-medium text-forest">
                {product.stock <= 5 ? `Only ${product.stock} left in stock` : "In stock"}
              </span>
            ) : (
              <span className="font-medium text-brick">Out of stock</span>
            )}
          </div>

          <div className="mt-6">
            <AddToCart productId={product._id} stock={product.stock} />
          </div>
        </div>
      </div>
    </div>
  );
}
