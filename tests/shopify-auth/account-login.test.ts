import { buildAccountLoginRedirect } from "@/app/account/login/page";
import { describe, expect, it } from "vitest";

describe("account login redirect", () => {
  it("redirects to /account/login when no query exists", () => {
    expect(buildAccountLoginRedirect()).toBe("/account/login");
  });

  it("preserves checkout_url query parameter", () => {
    expect(buildAccountLoginRedirect({ checkout_url: "/checkout/somewhere" })).toBe(
      "/account/login?checkout_url=%2Fcheckout%2Fsomewhere",
    );
  });

  it("preserves multi-value query parameters", () => {
    expect(buildAccountLoginRedirect({ foo: ["a", "b"] })).toBe("/account/login?foo=a&foo=b");
  });
});
