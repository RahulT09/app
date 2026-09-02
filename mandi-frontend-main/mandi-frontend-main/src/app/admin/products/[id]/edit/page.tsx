import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { backendJson } from "@/lib/backend";
import { ProductForm } from "@/components/admin/ProductForm";
import type { ApiResponse, Product } from "@/lib/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("JWT_TOKEN");

  const res = await backendJson<ApiResponse<Product>>(`/api/products/admin/${id}`, {
    cookie: token ? `JWT_TOKEN=${token.value}` : null,
  });

  if (res.status !== 200 || !res.body?.data) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Edit product</h1>
      <div className="mt-6 max-w-2xl">
        <ProductForm initial={res.body.data} />
      </div>
    </div>
  );
}
