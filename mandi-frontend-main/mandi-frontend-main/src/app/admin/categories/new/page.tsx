import { CategoryForm } from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">New category</h1>
      <div className="mt-6">
        <CategoryForm />
      </div>
    </div>
  );
}
