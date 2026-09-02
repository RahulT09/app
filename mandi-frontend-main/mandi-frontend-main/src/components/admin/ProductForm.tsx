"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, UploadCloud } from "lucide-react";
import { Input, Textarea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api-client";
import { productSchema } from "@/lib/validation";
import type { Category, Product } from "@/lib/types";

export function ProductForm({ initial }: { initial?: Product }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial ? String(initial.price) : "",
    stock: initial ? String(initial.stock) : "",
    category: initial
      ? typeof initial.category === "object"
        ? initial.category._id
        : initial.category
      : "",
  });
  const [existingImages, setExistingImages] = useState<string[]>(initial?.images ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { show } = useToast();
  const router = useRouter();

  useEffect(() => {
    api.get<Category[]>("/categories/admin/all").then(setCategories).catch(() => {
      // fall back to public list if admin list fails for some reason
      api.get<Category[]>("/categories").then(setCategories).catch(() => {});
    });
  }, []);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewFiles((prev) => [...prev, ...files].slice(0, 5));
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = productSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
      setErrors(fieldErrors);
      return;
    }

    if (!initial && newFiles.length === 0) {
      setErrors((e) => ({ ...e, images: "At least one image is required" }));
      return;
    }
    if (existingImages.length + newFiles.length === 0) {
      setErrors((e) => ({ ...e, images: "At least one image is required" }));
      return;
    }
    setErrors({});
    setSaving(true);

    try {
      const fd = new FormData();
      fd.set("name", result.data.name);
      fd.set("description", result.data.description);
      fd.set("price", String(result.data.price));
      fd.set("stock", String(result.data.stock));
      fd.set("category", result.data.category);
      for (const file of newFiles) fd.append("images", file);

      if (initial) {
        fd.set("existingImages", JSON.stringify(existingImages));
        await api.patchForm(`/products/${initial._id}`, fd);
        show("Product updated");
      } else {
        await api.postForm("/products", fd);
        show("Product created");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't save product", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-sm border border-line bg-white p-5" noValidate>
      <Input
        id="name"
        label="Product name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        error={errors.name}
      />
      <Textarea
        id="description"
        label="Description"
        rows={4}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        error={errors.description}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          id="price"
          label="Price (₹)"
          type="number"
          min={0}
          step="0.01"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          error={errors.price}
        />
        <Input
          id="stock"
          label="Stock"
          type="number"
          min={0}
          step="1"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          error={errors.stock}
        />
        <Select
          id="category"
          label="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          error={errors.category}
        >
          <option value="">Select…</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
              {!c.isActive ? " (inactive)" : ""}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink">Images</p>
        <div className="flex flex-wrap gap-3">
          {existingImages.map((url) => (
            <div key={url} className="relative h-20 w-20 overflow-hidden rounded-sm border border-line">
              <Image src={url} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setExistingImages((imgs) => imgs.filter((u) => u !== url))}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-paper"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {newFiles.map((file, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-sm border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setNewFiles((files) => files.filter((_, idx) => idx !== i))}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-paper"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-line text-ink/40 hover:border-ink hover:text-ink">
            <UploadCloud className="h-5 w-5" />
            <span className="text-[10px]">Add</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          </label>
        </div>
        {errors.images && <p className="mt-1.5 text-xs text-brick">{errors.images}</p>}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Create product"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
