import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">New product</h1>
      <div className="mt-6 max-w-2xl">
        <ProductForm />
      </div>
    </div>
  );
}
