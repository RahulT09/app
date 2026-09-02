export interface PincodeResult {
  city: string;
  state: string;
}

/**
 * Looks up an Indian PIN code via api.postalpincode.in (free, no key).
 * Called client-side directly since it's a public read-only lookup —
 * no need to route it through our own backend.
 */
export async function lookupPincode(pincode: string): Promise<PincodeResult | null> {
  if (!/^\d{6}$/.test(pincode)) return null;

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    if (!res.ok) return null;

    const data = await res.json();
    const postOffice = data?.[0]?.PostOffice?.[0];
    if (!postOffice) return null;

    return {
      city: postOffice.District,
      state: postOffice.State,
    };
  } catch {
    return null;
  }
}
