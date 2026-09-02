"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api-client";
import { addressSchema, type AddressInput } from "@/lib/validation";
import { lookupPincode } from "@/lib/pincode";
import type { Address } from "@/lib/types";

const emptyForm: AddressInput = {
  fullName: "",
  phoneNumber: "",
  addressLine: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

export function AddressForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Address;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<AddressInput>(
    initial
      ? {
          fullName: initial.fullName,
          phoneNumber: initial.phoneNumber,
          addressLine: initial.addressLine,
          city: initial.city,
          state: initial.state,
          postalCode: initial.postalCode,
          country: initial.country,
          isDefault: initial.isDefault,
        }
      : emptyForm,
  );
  const [errors, setErrors] = useState<Partial<Record<keyof AddressInput, string>>>({});
  const [pinLoading, setPinLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  async function handlePostalCodeBlur() {
    if (!/^\d{6}$/.test(form.postalCode)) return;
    setPinLoading(true);
    const result = await lookupPincode(form.postalCode);
    setPinLoading(false);
    if (result) {
      setForm((f) => ({ ...f, city: result.city, state: result.state }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = addressSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof AddressInput, string>> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as keyof AddressInput] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (initial) {
        await api.patch(`/addresses/${initial._id}`, result.data);
      } else {
        await api.post("/addresses", result.data);
      }
      show(initial ? "Address updated" : "Address added");
      onSaved();
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't save address", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-sm border border-line bg-white p-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="fullName"
          label="Full name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          error={errors.fullName}
        />
        <Input
          id="phoneNumber"
          label="Phone number"
          inputMode="numeric"
          placeholder="10-digit number"
          value={form.phoneNumber}
          onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          error={errors.phoneNumber}
        />
      </div>

      <Input
        id="addressLine"
        label="Address"
        placeholder="House no., street, locality"
        value={form.addressLine}
        onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
        error={errors.addressLine}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="relative">
          <Input
            id="postalCode"
            label="PIN code"
            inputMode="numeric"
            maxLength={6}
            value={form.postalCode}
            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
            onBlur={handlePostalCodeBlur}
            error={errors.postalCode}
            hint={pinLoading ? undefined : "City and state autofill from this"}
          />
          {pinLoading && (
            <Loader2 className="absolute right-3 top-9 h-4 w-4 animate-spin text-ink/40" />
          )}
        </div>
        <Input
          id="country"
          label="Country"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
          error={errors.country}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="city"
          label="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          error={errors.city}
        />
        <Input
          id="state"
          label="State"
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
          error={errors.state}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink/70">
        <input
          type="checkbox"
          checked={form.isDefault ?? false}
          onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          className="h-4 w-4 rounded-sm border-line accent-forest"
        />
        Set as default address
      </label>

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Add address"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
