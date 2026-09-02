"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Tags } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const { show } = useToast();

  const load = useCallback(async () => {
    try {
      const data = await api.get<Category[]>("/categories/admin/all");
      setCategories(data);
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't load categories", "error");
    }
  }, [show]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleActive(category: Category) {
    try {
      await api.patch(`/categories/${category._id}`, { isActive: !category.isActive });
      show(category.isActive ? "Category deactivated" : "Category reactivated");
      load();
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't update category", "error");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Categories</h1>
        <LinkButton href="/admin/categories/new" size="sm">
          <Plus className="h-4 w-4" /> New category
        </LinkButton>
      </div>

      {categories === null ? (
        <p className="mt-8 text-sm text-ink/50">Loading…</p>
      ) : categories.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Tags} title="No categories yet" action={<LinkButton href="/admin/categories/new">Add one</LinkButton>} />
        </div>
      ) : (
        <ul className="mt-5 flex flex-col divide-y divide-line rounded-sm border border-line bg-white">
          {categories.map((c) => (
            <li key={c._id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink">{c.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.isActive ? "bg-forest/10 text-forest" : "bg-ink/10 text-ink/50"
                    }`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {c.description && <p className="mt-0.5 text-sm text-ink/60">{c.description}</p>}
                <p className="mt-0.5 text-xs text-ink/40">Added {formatDate(c.createdAt)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/admin/categories/${c._id}/edit`}
                  className="flex h-8 w-8 items-center justify-center rounded-sm text-ink/50 hover:bg-ink/5 hover:text-ink"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <Button variant="ghost" size="sm" onClick={() => toggleActive(c)}>
                  {c.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
