"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, ClipboardList, LayoutDashboard, Settings, Tags } from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminNavigation() {
  const currentPath = usePathname();
  return (
    <nav aria-label="Admin navigation" className="flex gap-1 overflow-x-auto border-b border-[color:var(--line)] pb-3 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
      {links.map(({ href, label, icon: Icon }) => {
        const active = currentPath === href || (href !== "/admin" && currentPath.startsWith(`${href}/`));
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex h-10 shrink-0 items-center gap-2.5 rounded-sm px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[color:var(--accent)] ${active ? "bg-[color:var(--ink)] text-white" : "text-[color:var(--muted)] hover:bg-white hover:text-[color:var(--ink)]"}`}>
            <Icon size={15} /> {label}
          </Link>
        );
      })}
    </nav>
  );
}