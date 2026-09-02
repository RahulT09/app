import Link from "next/link";
import Image from "next/image";
import { PackageX } from "lucide-react";
import { PriceTag } from "@/components/ui/PriceTag";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;
  const categoryName =
    typeof product.category === "object" ? product.category.name : undefined;

  return (
    <Link
      href={`/products/${product._id}`}
      className="group flex flex-col overflow-hidden rounded-sm border border-line bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-paper">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink/20">
            <PackageX className="h-10 w-10" strokeWidth={1.5} />
          </div>
        )}
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-ink/90 px-2.5 py-1 text-[11px] font-medium text-paper">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        {categoryName && (
          <span className="font-display text-[11px] font-semibold uppercase tracking-wider text-forest">
            {categoryName}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium text-ink">{product.name}</h3>
        <div className="mt-auto pt-1.5">
          <PriceTag amount={product.price} size="sm" />
        </div>
      </div>
    </Link>
  );
}
