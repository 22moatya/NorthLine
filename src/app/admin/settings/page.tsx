import type { Metadata } from "next";
import SettingsForm from "@/components/admin/SettingsForm";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = { title: "Store settings", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <section>
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--accent)]">Store</p>
        <h2 className="mt-1 font-display text-3xl text-[color:var(--ink)]">Settings</h2>
      </div>
      <SettingsForm settings={settings} />
    </section>
  );
}
