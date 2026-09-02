"use client";

import { useEffect, useState, useCallback } from "react";
import { MapPin, Plus, Pencil, Trash2, Star } from "lucide-react";
import { AddressForm } from "@/app/addresses/AddressForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api-client";
import type { Address } from "@/lib/types";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const { show } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Address[]>("/addresses");
      setAddresses(data);
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't load addresses", "error");
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this address?")) return;
    try {
      await api.del(`/addresses/${id}`);
      show("Address deleted");
      load();
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't delete address", "error");
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await api.patch(`/addresses/${id}/default`);
      load();
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't set default", "error");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Addresses</h1>
        {!formOpen && (
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> Add address
          </Button>
        )}
      </div>

      {formOpen && (
        <div className="mt-6">
          <AddressForm
            initial={editing ?? undefined}
            onSaved={() => {
              setFormOpen(false);
              setEditing(null);
              load();
            }}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-ink/50">Loading…</p>
      ) : addresses.length === 0 && !formOpen ? (
        <div className="mt-6">
          <EmptyState
            icon={MapPin}
            title="No addresses yet"
            description="Add one so checkout is a single tap next time."
            action={<Button onClick={() => setFormOpen(true)}>Add your first address</Button>}
          />
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {addresses.map((addr) => (
            <li key={addr._id} className="rounded-sm border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{addr.fullName}</p>
                    {addr.isDefault && (
                      <span className="flex items-center gap-1 rounded-full bg-marigold/20 px-2 py-0.5 text-[11px] font-medium text-ink">
                        <Star className="h-3 w-3 fill-current" /> Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink/60">
                    {addr.addressLine}, {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                  </p>
                  <p className="mt-1 font-mono text-xs text-ink/50">{addr.phoneNumber}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => { setEditing(addr); setFormOpen(true); }}
                    className="flex h-8 w-8 items-center justify-center rounded-sm text-ink/50 hover:bg-ink/5 hover:text-ink"
                    aria-label="Edit address"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="flex h-8 w-8 items-center justify-center rounded-sm text-ink/50 hover:bg-brick/5 hover:text-brick"
                    aria-label="Delete address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr._id)}
                  className="mt-3 text-xs font-medium text-forest hover:underline"
                >
                  Set as default
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
