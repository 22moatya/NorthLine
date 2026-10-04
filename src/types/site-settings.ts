export const CURRENCIES = [
  { code: "USD", label: "US dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British pound", symbol: "£" },
  { code: "EGP", label: "Egyptian pound", symbol: "ج.م" },
  { code: "SAR", label: "Saudi riyal", symbol: "ر.س" },
  { code: "AED", label: "UAE dirham", symbol: "د.إ" },
  { code: "CAD", label: "Canadian dollar", symbol: "CA$" },
  { code: "AUD", label: "Australian dollar", symbol: "A$" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export interface SiteSettings {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  currency: CurrencyCode;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  shippingFlatRate: number;
  freeShippingThreshold: number | null;
  taxRatePercent: number;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  storeName: "Northline Market",
  contactEmail: "",
  contactPhone: "",
  currency: "USD",
  logoUrl: "",
  primaryColor: "#202b25",
  accentColor: "#d84e31",
  backgroundColor: "#f7f8f5",
  shippingFlatRate: 0,
  freeShippingThreshold: null,
  taxRatePercent: 0,
};

export function formatMoney(amount: number, currency: CurrencyCode): string {
  const symbol = CURRENCIES.find((option) => option.code === currency)?.symbol;
  const formattedAmount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  const displaySymbol = symbol ?? currency;
  const separator = ["$", "€", "£", "CA$", "A$"].includes(displaySymbol) ? "" : " ";
  return `${displaySymbol}${separator}${formattedAmount}`;
}

export function calculateOrderCharges(
  subtotal: number,
  settings: Pick<SiteSettings, "shippingFlatRate" | "freeShippingThreshold" | "taxRatePercent">,
): { shippingCost: number; taxAmount: number; total: number } {
  const shippingCost =
    settings.freeShippingThreshold !== null && subtotal >= settings.freeShippingThreshold
      ? 0
      : settings.shippingFlatRate;
  const taxAmount = Math.round(subtotal * settings.taxRatePercent) / 100;
  return {
    shippingCost,
    taxAmount,
    total: Math.round((subtotal + shippingCost + taxAmount) * 100) / 100,
  };
}
