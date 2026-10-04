"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CURRENCIES, type SiteSettings } from "@/types/site-settings";

export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [errorSection, setErrorSection] = useState("");
  const [savedSection, setSavedSection] = useState("");
  const [savingSection, setSavingSection] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>, section: string) {
    event.preventDefault();
    setSavingSection(section);
    setErrorMessage("");
    setErrorSection(section);
    setSavedSection("");

    const formData = new FormData(event.currentTarget);
    let body: Record<string, string | number | null>;

    switch (section) {
      case "details":
        body = {
          storeName: String(formData.get("storeName") ?? ""),
          contactEmail: String(formData.get("contactEmail") ?? ""),
          contactPhone: String(formData.get("contactPhone") ?? ""),
        };
        break;
      case "branding":
        body = {
          logoUrl: String(formData.get("logoUrl") ?? ""),
          primaryColor: String(formData.get("primaryColor") ?? ""),
          accentColor: String(formData.get("accentColor") ?? ""),
          backgroundColor: String(formData.get("backgroundColor") ?? ""),
        };
        break;
      case "currency":
        body = { currency: String(formData.get("currency") ?? "") };
        break;
      case "shipping-tax": {
        const threshold = String(formData.get("freeShippingThreshold") ?? "").trim();
        body = {
          shippingFlatRate: Number(formData.get("shippingFlatRate")),
          freeShippingThreshold: threshold ? Number(threshold) : null,
          taxRatePercent: Number(formData.get("taxRatePercent")),
        };
        break;
      }
      default:
        setErrorMessage("Unknown settings section.");
        setErrorSection(section);
        setSavingSection("");
        return;
    }

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message ?? "We could not save store settings.");
        return;
      }

      setSavedSection(section);
      router.refresh();
    } catch {
      setErrorMessage("We could not reach the settings service. Please try again.");
    } finally {
      setSavingSection("");
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
    <form onSubmit={(event) => void submit(event, "details")} className="space-y-5 border border-[color:var(--line)] bg-white p-5 sm:p-7">
      <h3 className="font-display text-xl text-[color:var(--ink)]">Store information</h3>
      <label className="block text-xs font-semibold text-[color:var(--ink)]">
        Store name
        <input name="storeName" required maxLength={100} defaultValue={settings.storeName} className="auth-input mt-1.5" />
      </label>
      <label className="block text-xs font-semibold text-[color:var(--ink)]">
        Contact email
        <input name="contactEmail" type="email" maxLength={254} defaultValue={settings.contactEmail} className="auth-input mt-1.5" />
      </label>
      <label className="block text-xs font-semibold text-[color:var(--ink)]">
        Contact phone
        <input name="contactPhone" type="tel" maxLength={30} defaultValue={settings.contactPhone} className="auth-input mt-1.5" />
      </label>
      {errorMessage && errorSection === "details" ? <p role="alert" className="text-xs text-[color:var(--accent)]">{errorMessage}</p> : null}
      {savedSection === "details" ? <p role="status" className="text-xs text-[color:var(--stock)]">Store information saved.</p> : null}
      <button disabled={savingSection !== ""} className="flex h-11 items-center justify-center rounded-sm bg-[color:var(--ink)] px-5 text-xs font-semibold text-white transition-colors hover:bg-[color:var(--accent)] disabled:opacity-50">
        {savingSection === "details" ? "Saving…" : "Save store information"}
      </button>
    </form>

    <form onSubmit={(event) => void submit(event, "branding")} className="space-y-5 border border-[color:var(--line)] bg-white p-5 sm:p-7">
      <h3 className="font-display text-xl text-[color:var(--ink)]">Logo and colors</h3>
      <label className="block text-xs font-semibold text-[color:var(--ink)]">
        Logo URL
        <input name="logoUrl" type="text" maxLength={2048} defaultValue={settings.logoUrl} placeholder="/logo.png or https://..." className="auth-input mt-1.5" />
        <span className="mt-1 block font-normal text-[color:var(--muted)]">Use a site path or HTTPS image address. Leave blank to show the store initial.</span>
      </label>
      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 text-xs font-semibold text-[color:var(--ink)]">Store colors</legend>
        {([
          ["primaryColor", "Primary"],
          ["accentColor", "Accent"],
          ["backgroundColor", "Background"],
        ] as const).map(([name, label]) => (
          <label key={name} className="block text-xs font-semibold text-[color:var(--ink)]">
            {label}
            <span className="mt-1.5 flex h-11 items-center gap-3 border border-[color:var(--line)] px-2">
              <input name={name} type="color" required defaultValue={settings[name]} className="size-8 cursor-pointer border-0 bg-transparent p-0" />
              <span className="font-mono text-[11px] text-[color:var(--muted)]">{settings[name]}</span>
            </span>
          </label>
        ))}
      </fieldset>
      {errorMessage && errorSection === "branding" ? <p role="alert" className="text-xs text-[color:var(--accent)]">{errorMessage}</p> : null}
      {savedSection === "branding" ? <p role="status" className="text-xs text-[color:var(--stock)]">Logo and colors saved.</p> : null}
      <button disabled={savingSection !== ""} className="flex h-11 items-center justify-center rounded-sm bg-[color:var(--ink)] px-5 text-xs font-semibold text-white transition-colors hover:bg-[color:var(--accent)] disabled:opacity-50">
        {savingSection === "branding" ? "Saving…" : "Save logo and colors"}
      </button>
    </form>

    <form onSubmit={(event) => void submit(event, "currency")} className="space-y-5 border border-[color:var(--line)] bg-white p-5 sm:p-7">
      <h3 className="font-display text-xl text-[color:var(--ink)]">Currency</h3>
      <label className="block text-xs font-semibold text-[color:var(--ink)]">
        Display currency
        <select name="currency" defaultValue={settings.currency} className="auth-input mt-1.5">
          {CURRENCIES.map(({ code, label, symbol }) => (
            <option key={code} value={code}>{label} ({code} · {symbol})</option>
          ))}
        </select>
        <span className="mt-1 block font-normal leading-5 text-[color:var(--muted)]">
          This changes the currency symbol only. Product prices and order totals are not converted.
        </span>
      </label>
      {errorMessage && errorSection === "currency" ? <p role="alert" className="text-xs text-[color:var(--accent)]">{errorMessage}</p> : null}
      {savedSection === "currency" ? <p role="status" className="text-xs text-[color:var(--stock)]">Currency saved.</p> : null}
      <button disabled={savingSection !== ""} className="flex h-11 items-center justify-center rounded-sm bg-[color:var(--ink)] px-5 text-xs font-semibold text-white transition-colors hover:bg-[color:var(--accent)] disabled:opacity-50">
        {savingSection === "currency" ? "Saving…" : "Save currency"}
      </button>
    </form>

    <form onSubmit={(event) => void submit(event, "shipping-tax")} className="space-y-5 border border-[color:var(--line)] bg-white p-5 sm:p-7">
      <h3 className="font-display text-xl text-[color:var(--ink)]">Shipping and tax</h3>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[color:var(--ink)]">
          Flat shipping charge
          <input name="shippingFlatRate" type="number" min="0" max="1000000" step="0.01" required defaultValue={settings.shippingFlatRate} className="auth-input mt-1.5" />
        </label>
        <label className="block text-xs font-semibold text-[color:var(--ink)]">
          Free shipping above
          <input name="freeShippingThreshold" type="number" min="0" max="1000000" step="0.01" defaultValue={settings.freeShippingThreshold ?? ""} placeholder="Disabled" className="auth-input mt-1.5" />
          <span className="mt-1 block font-normal text-[color:var(--muted)]">Leave empty to disable free shipping.</span>
        </label>
        <label className="block text-xs font-semibold text-[color:var(--ink)] sm:col-span-2">
          Tax rate (%)
          <input name="taxRatePercent" type="number" min="0" max="100" step="0.01" required defaultValue={settings.taxRatePercent} className="auth-input mt-1.5" />
          <span className="mt-1 block font-normal text-[color:var(--muted)]">One rate applied to the product subtotal. Tax is not added to shipping.</span>
        </label>
      </fieldset>
      {errorMessage && errorSection === "shipping-tax" ? <p role="alert" className="text-xs text-[color:var(--accent)]">{errorMessage}</p> : null}
      {savedSection === "shipping-tax" ? <p role="status" className="text-xs text-[color:var(--stock)]">Shipping and tax saved.</p> : null}
      <button disabled={savingSection !== ""} className="flex h-11 items-center justify-center rounded-sm bg-[color:var(--ink)] px-5 text-xs font-semibold text-white transition-colors hover:bg-[color:var(--accent)] disabled:opacity-50">
        {savingSection === "shipping-tax" ? "Saving…" : "Save shipping and tax"}
      </button>
    </form>
    </div>
  );
}
