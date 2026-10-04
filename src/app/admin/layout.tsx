import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { hasAdminAccess } from "@/lib/admin-access";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/account/login?callbackUrl=/admin");
  if (!hasAdminAccess(session.user)) redirect("/account");

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1500px] px-4 py-8 sm:px-7 lg:px-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--line)] pb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[color:var(--accent)]">Northline / Operations</p>
          <h1 className="mt-1 font-display text-3xl text-[color:var(--ink)]">Admin</h1>
        </div>
        <p className="text-xs text-[color:var(--muted)]">Signed in as {session.user.email}</p>
      </div>
      <div className="grid gap-7 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-9">
        <AdminNavigation />
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}