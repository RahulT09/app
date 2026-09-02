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
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          className="lg:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link href="/" className="flex items-center gap-1.5 font-display text-2xl font-bold tracking-tight text-ink">
          MANDI
          <span className="h-1.5 w-1.5 rounded-full bg-marigold" aria-hidden />
        </Link>

        <form onSubmit={handleSearch} className="relative hidden flex-1 max-w-md lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="h-10 w-full rounded-sm border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-ink"
          />
        </form>

        <nav className="hidden items-center gap-6 font-display text-sm font-medium lg:flex">
          <Link href="/products" className="hover:text-forest">Shop</Link>
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="flex items-center gap-1 hover:text-forest">
              <LayoutDashboard className="h-4 w-4" /> Admin
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-sm hover:bg-ink/5"
            aria-label={`Cart, ${itemCount} items`}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-marigold px-1 text-[10px] font-bold text-ink">
                {itemCount}
              </span>
            )}
          </Link>

          <div className="relative">
            <button
              onClick={() => setAccountOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-sm hover:bg-ink/5"
              aria-label="Account menu"
              aria-expanded={accountOpen}
            >
              {user ? (
                <img
                  src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundType=gradientLinear`}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <UserIcon className="h-5 w-5" />
              )}
            </button>
            {accountOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setAccountOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-52 rounded-sm border border-line bg-white py-1.5 shadow-lg">
                  {user ? (
                    <>
                      <div className="border-b border-line px-4 py-2.5">
                        <p className="truncate text-sm font-medium text-ink">{user.name}</p>
                        <p className="truncate text-xs text-ink/50">{user.email}</p>
                      </div>
                      <Link href="/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-ink/5">
                        <UserIcon className="h-4 w-4" /> Profile
                      </Link>
                      <Link href="/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-ink/5">
                        <Package className="h-4 w-4" /> Orders
                      </Link>
                      <Link href="/addresses" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-ink/5">
                        <MapPin className="h-4 w-4" /> Addresses
                      </Link>
                      <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-brick hover:bg-brick/5">
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm hover:bg-ink/5">
                        Log in
                      </Link>
                      <Link href="/register" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm hover:bg-ink/5">
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

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-ink/40" onClick={() => setMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-paper p-5">
            <div className="flex items-center justify-between">
              <span className="font-display text-xl font-bold">MANDI</span>
              <button aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSearch} className="relative mt-5">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products"
                className="h-10 w-full rounded-sm border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-ink"
              />
            </form>
            <nav className="mt-6 flex flex-col gap-1 font-display text-base font-medium">
              <Link href="/products" onClick={() => setMenuOpen(false)} className="rounded-sm px-2 py-2.5 hover:bg-ink/5">Shop</Link>
              {user?.role === "ADMIN" && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="rounded-sm px-2 py-2.5 hover:bg-ink/5">Admin</Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
