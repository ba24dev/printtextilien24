import { buildCheckoutUrl } from "@/components/cart/CartFooter";
import { describe, expect, it } from "vitest";

describe("cart footer checkout URL", () => {
  it("always sets logged_in=true on checkout URL", () => {
    const url = buildCheckoutUrl(
      "https://12d54a-a9.myshopify.com/checkouts/cn/abc?locale=de-DE&_s=123",
    );
    expect(url).toBe(
      "https://12d54a-a9.myshopify.com/checkouts/cn/abc?locale=de-DE&_s=123&logged_in=true",
    );
  });

  it("returns null for invalid checkout URL", () => {
    expect(buildCheckoutUrl("not-a-url")).toBeNull();
  });
});
