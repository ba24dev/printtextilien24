import { SITE_LOCALE } from "@/config/app-config";

export function formatPrice(
  amount: string | number | undefined,
  currencyCode: string = "EUR"
) {
  if (!amount) {
    return "";
  }

  return Number(amount).toLocaleString(SITE_LOCALE, {
    style: "currency",
    currency: currencyCode,
  });
}

export function convertTime(
  inputValue: number,
  from: "ms" | "s" | "min" | "h",
  to: "ms" | "s" | "min" | "h"
) {
  const timeInMs =
    from === "ms"
      ? inputValue
      : from === "s"
      ? inputValue * 1000
      : from === "min"
      ? inputValue * 60 * 1000
      : from === "h"
      ? inputValue * 60 * 60 * 1000
      : 0;

  return to === "ms"
    ? timeInMs
    : to === "s"
    ? timeInMs / 1000
    : to === "min"
    ? timeInMs / (60 * 1000)
    : to === "h"
    ? timeInMs / (60 * 60 * 1000)
    : 0;
}
