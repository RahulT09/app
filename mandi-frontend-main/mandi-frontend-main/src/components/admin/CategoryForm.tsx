"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api-client";
import { categorySchema } from "@/lib/validation";
import type { Category } from "@/lib/types";

export function CategoryForm({ initial }: { initial?: Category }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [errors, setErrors] = useState<{ name?: string; description?: string; form?: string }>({});
  const [saving, setSaving] = useState(false);
  const { show } = useToast();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = categorySchema.safeParse({ name, description });
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as "name" | "description"] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (initial) {
        await api.patch(`/categories/${initial._id}`, result.data);
        show("Category updated");
      } else {
        await api.post("/categories", result.data);
        show("Category created");
      }
      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      setErrors({ form: err instanceof ApiError ? err.message : "Couldn't save category" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-sm border border-line bg-white p-5" noValidate>
      <Input id="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
      <Textarea
        id="description"
        label="Description (optional)"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
      />
      {errors.form && <p className="text-sm text-brick">{errors.form}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Create category"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/categories")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
