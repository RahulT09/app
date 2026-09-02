import Link from "next/link";
import { cookies } from "next/headers";
import { Package, Tags, ClipboardList, Clock } from "lucide-react";
import { backendJson } from "@/lib/backend";
import type { ApiResponse, Pagination } from "@/lib/types";

async function getCount(path: string, cookieHeader: string) {
  const res = await backendJson<ApiResponse<unknown[]>>(`${path}`, { cookie: cookieHeader });
  const pagination = res.body?.pagination as Pagination | undefined;
  return pagination?.totalProducts ?? pagination?.totalOrders ?? res.body?.count ?? 0;
}

export default async function AdminOverviewPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("JWT_TOKEN");
  const cookieHeader = token ? `JWT_TOKEN=${token.value}` : "";

  const [products, categories, orders, pending] = await Promise.all([
    getCount("/api/products/admin/all?limit=1", cookieHeader),
    getCount("/api/categories/admin/all", cookieHeader),
    getCount("/api/orders/admin/all?limit=1", cookieHeader),
    getCount("/api/orders/admin/all?limit=1&status=PENDING", cookieHeader),
  ]);

  const cards = [
    { label: "Products", value: products, href: "/admin/products", icon: Package },
    { label: "Categories", value: categories, href: "/admin/categories", icon: Tags },
    { label: "Orders", value: orders, href: "/admin/orders", icon: ClipboardList },
    { label: "Pending orders", value: pending, href: "/admin/orders?status=PENDING", icon: Clock },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="rounded-sm border border-line bg-white p-4 hover:border-ink"
          >
            <Icon className="h-5 w-5 text-ink/40" />
            <p className="mt-3 font-mono text-2xl font-bold text-ink">{value}</p>
            <p className="text-sm text-ink/60">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
