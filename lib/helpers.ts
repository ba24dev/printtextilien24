export function formatPrice(amount: string | number | undefined, currencyCode: string = "EUR") {
    if (!amount) {
        return "";
    }

    return Number(amount).toLocaleString(process.env.NEXT_PUBLIC_LOCALE, {
        style: "currency",
        currency: currencyCode,
    });
}
