import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#EBE7DF] bg-[#FAF8F5]">
      {/* Guarantees bar */}
      <div className="border-b border-[#EBE7DF] bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-[#EAA228]" />
              <div>
                <p className="text-xs font-bold text-gray-900">Fast Delivery</p>
                <p className="text-[11px] text-gray-500">29,000+ pincodes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#EAA228]" />
              <div>
                <p className="text-xs font-bold text-gray-900">100% Authentic</p>
                <p className="text-[11px] text-gray-500">Directly sourced</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-[#EAA228]" />
              <div>
                <p className="text-xs font-bold text-gray-900">Easy Returns</p>
                <p className="text-[11px] text-gray-500">7-day return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Headphones className="h-5 w-5 text-[#EAA228]" />
              <div>
                <p className="text-xs font-bold text-gray-900">24/7 Support</p>
                <p className="text-[11px] text-gray-500">Always here to help</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-1.5 text-2xl font-extrabold tracking-tight text-[#141E18]">
              MANDI
              <span className="h-2 w-2 rounded-full bg-[#EAA228]" aria-hidden />
            </Link>
            <p className="mt-3 max-w-xs text-xs text-gray-600 leading-relaxed">
              Everyday goods, honest prices. Delivered directly to your door across India without middlemen markup.
            </p>
          </div>

          <div className="flex flex-wrap gap-12 text-xs">
            <div>
              <p className="mb-3 font-bold uppercase tracking-wider text-gray-900">Shop</p>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/products" className="hover:text-black">All products</Link></li>
                <li><Link href="/products?category=beauty" className="hover:text-black">Beauty & Personal Care</Link></li>
                <li><Link href="/products?category=fragrances" className="hover:text-black">Fragrances</Link></li>
                <li><Link href="/products?category=groceries" className="hover:text-black">Groceries</Link></li>
                <li><Link href="/cart" className="hover:text-black">Shopping Cart</Link></li>
              </ul>
            </div>

            <div>
              <p className="mb-3 font-bold uppercase tracking-wider text-gray-900">Account</p>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/profile" className="hover:text-black">My Profile</Link></li>
                <li><Link href="/orders" className="hover:text-black">My Orders</Link></li>
                <li><Link href="/addresses" className="hover:text-black">Saved Addresses</Link></li>
              </ul>
            </div>

            <div>
              <p className="mb-3 font-bold uppercase tracking-wider text-gray-900">Help & Info</p>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/orders" className="hover:text-black">Track Order</Link></li>
                <li><Link href="/products" className="hover:text-black">Shipping Policy</Link></li>
                <li><Link href="/products" className="hover:text-black">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[#EBE7DF] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Mandi Technologies Pvt. Ltd. All prices in INR.</p>
          <p className="flex items-center gap-2">
            <span>Made with precision in India 🇮🇳</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
