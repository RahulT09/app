import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-xl font-bold tracking-tight text-ink">
              MANDI<span className="text-marigold">.</span>
            </p>
            <p className="mt-2 max-w-xs text-sm text-ink/60">
              Everyday goods, honest prices. Shipped across India.
            </p>
          </div>
          <div className="flex gap-12 font-display text-sm">
            <div>
              <p className="mb-3 font-semibold text-ink/80">Shop</p>
              <ul className="space-y-2 text-ink/60">
                <li><Link href="/products" className="hover:text-forest">All products</Link></li>
                <li><Link href="/cart" className="hover:text-forest">Cart</Link></li>
                <li><Link href="/orders" className="hover:text-forest">Track an order</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-semibold text-ink/80">Account</p>
              <ul className="space-y-2 text-ink/60">
                <li><Link href="/profile" className="hover:text-forest">Profile</Link></li>
                <li><Link href="/addresses" className="hover:text-forest">Addresses</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-line pt-6 text-xs text-ink/40">
          © {new Date().getFullYear()} Mandi. All prices in INR.
        </p>
      </div>
    </footer>
  );
}
