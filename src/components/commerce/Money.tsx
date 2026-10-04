"use client";

import { formatMoney } from "@/types/site-settings";
import { useSiteSettings } from "@/components/commerce/SiteSettingsContext";

export default function Money({ amount }: { amount: number }) {
  const { currency } = useSiteSettings();
  return <>{formatMoney(amount, currency)}</>;
}
