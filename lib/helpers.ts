import { SITE_LOCALE } from "@/config/app-config";

export function formatPrice(amount: string | number | undefined, currencyCode: string = "EUR") {
  if (!amount) {
    return "";
  }

  return Number(amount).toLocaleString(SITE_LOCALE, {
    style: "currency",
    currency: currencyCode,
  });
}
