"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  User as UserIcon,
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  MapPin,
} from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { api } from "@/lib/api-client";
import type { User } from "@/lib/types";

export function Header({ user }: { user: User | null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { itemCount } = useCart();
  const router = useRouter();

  async function handleLogout() {
    setAccountOpen(false);
    await api.post("/auth/logout");
    router.push("/");
    router.refresh();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query.trim() ? `/products?search=${encodeURIComponent(query.trim())}` : "/products");
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#EBE7DF] bg-[#FAF8F5]/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Menu Button & Brand */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-1.5 text-gray-800 hover:text-black"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="flex items-center gap-1.5 text-2xl font-extrabold tracking-tight text-[#141E18]">
            MANDI
            <span className="h-2 w-2 rounded-full bg-[#EAA228]" aria-hidden />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-7 text-[13.5px] font-semibold text-[#3C3F3D] lg:flex">
          <Link href="/products" className="hover:text-black transition-colors">
            Shop
          </Link>
          <Link href="/#categories" className="hover:text-black transition-colors">
            Categories
          </Link>
          <Link href="/products?category=beauty" className="hover:text-black transition-colors">
            About
          </Link>
          <Link href="/orders" className="hover:text-black transition-colors">
            Track Order
          </Link>
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="flex items-center gap-1 text-[#22382B] hover:text-black transition-colors">
              <LayoutDashboard className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
        </nav>

        {/* Center Search Input */}
        <form onSubmit={handleSearch} className="relative hidden max-w-md flex-1 md:block lg:max-w-lg">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-4 h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, brands and more..."
              className="h-10 w-full rounded-full border border-[#E2DDD3] bg-[#F4F2EC] pl-10 pr-4 text-xs font-normal text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#BDB5A4] focus:bg-white"
            />
          </div>
        </form>

        {/* Right Action Icons: Wishlist, Cart, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wishlist Link */}
          <Link
            href="/products"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#2B302D] hover:bg-[#EFECE5] transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5 stroke-[1.75]" />
          </Link>

          {/* Cart Link with Badge */}
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#2B302D] hover:bg-[#EFECE5] transition-colors"
            aria-label={`Cart, ${itemCount} items`}
          >
            <ShoppingBag className="h-5 w-5 stroke-[1.75]" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EAA228] px-1 text-[10px] font-bold text-[#141E18]">
              {itemCount > 0 ? itemCount : 2}
            </span>
          </Link>

          {/* Account Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setAccountOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#2B302D] hover:bg-[#EFECE5] transition-colors"
              aria-label="Account menu"
              aria-expanded={accountOpen}
            >
              {user ? (
                <img
                  src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundType=gradientLinear`}
                  alt=""
                  className="h-8 w-8 rounded-full border border-[#E5E0D5]"
                />
              ) : (
                <UserIcon className="h-5 w-5 stroke-[1.75]" />
              )}
            </button>

            {accountOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setAccountOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-[#E8E4DB] bg-white py-2 shadow-xl">
                  {user ? (
                    <>
                      <div className="border-b border-[#E8E4DB] px-4 py-3">
                        <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="truncate text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link href="/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-[#FAF8F5]">
                        <UserIcon className="h-4 w-4 text-gray-500" /> Profile
                      </Link>
                      <Link href="/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-[#FAF8F5]">
                        <Package className="h-4 w-4 text-gray-500" /> Orders
                      </Link>
                      <Link href="/addresses" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-[#FAF8F5]">
                        <MapPin className="h-4 w-4 text-gray-500" /> Addresses
                      </Link>
                      {user.role === "ADMIN" && (
                        <Link href="/admin" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-[#22382B] hover:bg-[#FAF8F5]">
                          <LayoutDashboard className="h-4 w-4 text-[#22382B]" /> Admin Dashboard
                        </Link>
                      )}
                      <button onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4 text-red-500" /> Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-xs font-semibold text-gray-800 hover:bg-[#FAF8F5]">
                        Log in
                      </Link>
                      <Link href="/register" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-xs font-medium text-gray-600 hover:bg-[#FAF8F5]">
                        Create account
                      </Link>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-80 flex-col bg-[#FAF8F5] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xl font-bold tracking-tight text-[#141E18]">
                MANDI
                <span className="h-2 w-2 rounded-full bg-[#EAA228]" />
              </span>
              <button aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                <X className="h-6 w-6 text-gray-700" />
              </button>
            </div>

            <form onSubmit={handleSearch} className="relative mt-6">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="h-10 w-full rounded-full border border-[#E2DDD3] bg-[#F4F2EC] pl-10 pr-4 text-xs outline-none focus:bg-white"
              />
            </form>

            <nav className="mt-8 flex flex-col gap-2 text-sm font-semibold text-[#2C302D]">
              <Link href="/products" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 hover:bg-[#EFECE5]">
                Shop
              </Link>
              <Link href="/#categories" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 hover:bg-[#EFECE5]">
                Categories
              </Link>
              <Link href="/products?category=beauty" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 hover:bg-[#EFECE5]">
                About
              </Link>
              <Link href="/orders" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 hover:bg-[#EFECE5]">
                Track Order
              </Link>
              {user?.role === "ADMIN" && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 hover:bg-[#EFECE5] text-[#22382B]">
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
