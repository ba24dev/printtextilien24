"use client";

export const dynamic = "force-dynamic";

import { copy } from "@/config/copy";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

const RECENT_LOGOUT_COOKIE = "shopify_recent_logout";

type SearchParams = Record<string, string | string[] | undefined>;

export function buildAccountLoginRedirect(searchParams?: SearchParams): string {
  const query = new URLSearchParams();
  if (!searchParams) return "/account/login";

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      query.append(key, value);
      continue;
    }
    if (Array.isArray(value)) {
      for (const v of value) {
        query.append(key, v);
      }
    }
  }

  const qs = query.toString();
  return qs ? `/account/login?${qs}` : "/account/login";
}

const STOREFRONT_HOST = (() => {
  const raw = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL;
  if (!raw) return null;
  try {
    return new URL(raw).host;
  } catch {
    return null;
  }
})();

function getSafeCheckoutUrl(raw: string | null): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;

  if (value.startsWith("/") && !value.startsWith("//")) {
    if (value.startsWith("/checkouts/")) {
      if (!STOREFRONT_HOST) return null;
      const checkoutUrl = new URL(value, `https://${STOREFRONT_HOST}`);
      checkoutUrl.searchParams.set("logged_in", "true");
      return checkoutUrl.toString();
    }
    return value;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    if (parsed.pathname.startsWith("/checkouts/") && STOREFRONT_HOST) {
      parsed.protocol = "https:";
      parsed.host = STOREFRONT_HOST;
      parsed.searchParams.set("logged_in", "true");
      return parsed.toString();
    }

    if (STOREFRONT_HOST && parsed.host === STOREFRONT_HOST) {
      return parsed.toString();
    }

    return null;
  } catch {
    return null;
  }
}

export function getSafeReturnTo(raw: string | null): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export function buildCustomerLoginHref({
  checkoutUrl,
  returnTo,
}: {
  checkoutUrl?: string | null;
  returnTo?: string | null;
}): string {
  const safeCheckoutUrl = getSafeCheckoutUrl(checkoutUrl ?? null);
  if (safeCheckoutUrl) {
    return `/api/auth/customer/login?checkout_url=${encodeURIComponent(safeCheckoutUrl)}`;
  }

  const safeReturnTo = getSafeReturnTo(returnTo ?? null);
  if (safeReturnTo) {
    return `/api/auth/customer/login?return_to=${encodeURIComponent(safeReturnTo)}`;
  }

  return "/api/auth/customer/login";
}

export function shouldAutoStartShopifyLogin({
  checkoutUrl,
  suppressAutoRedirect,
}: {
  checkoutUrl: string | null;
  suppressAutoRedirect: boolean;
}): boolean {
  return Boolean(checkoutUrl) && !suppressAutoRedirect;
}

function hasRecentLogoutCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((entry) => entry.trim() === `${RECENT_LOGOUT_COOKIE}=1`);
}

function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recentLogout, setRecentLogout] = useState(false);

  useEffect(() => {
    setRecentLogout(hasRecentLogoutCookie());
  }, []);

  const reason = searchParams.get("reason");
  const logoutNotice = searchParams.get("logout") === "1" || recentLogout;
  const checkoutUnavailable =
    reason === "checkout_unavailable" ||
    searchParams.get("checkout_error") === "1";
  const authSessionExpired = reason === "auth_session_expired";
  const authInvalidCallback = reason === "auth_invalid_callback";
  const hasBlockingNotice =
    logoutNotice ||
    checkoutUnavailable ||
    authInvalidCallback ||
    authSessionExpired;
  const rawCheckoutUrl = searchParams.get("checkout_url");
  const checkoutUrl = useMemo(
    () => getSafeCheckoutUrl(rawCheckoutUrl),
    [rawCheckoutUrl],
  );
  const returnTo = useMemo(
    () => getSafeReturnTo(searchParams.get("return_to")),
    [searchParams],
  );

  const isCheckoutLoginFlow =
    typeof rawCheckoutUrl === "string" &&
    rawCheckoutUrl.includes("logged_in=true");

  const cameFromShopifyCheckoutLogout =
    typeof rawCheckoutUrl === "string" &&
    !rawCheckoutUrl.includes("logged_in=true") &&
    !hasBlockingNotice &&
    !recentLogout;

  const loginHref = useMemo(
    () => buildCustomerLoginHref({ checkoutUrl, returnTo }),
    [checkoutUrl, returnTo],
  );
  const suppressAutoRedirect =
    hasBlockingNotice || cameFromShopifyCheckoutLogout;

  const autoRedirectToShopify = shouldAutoStartShopifyLogin({
    checkoutUrl,
    suppressAutoRedirect,
  });

  // if already logged in, send straight to account/checkouts.
  // for checkout-origin sign-in, start OAuth immediately unless we're
  // intentionally showing a blocking notice (logout/error state).
  useEffect(() => {
    if (hasBlockingNotice) return;
    fetch("/api/customer/session", { credentials: "include" })
      .then((res) => res.json())
      .then((sess) => {
        if (sess?.loggedIn) {
          if (isCheckoutLoginFlow && checkoutUrl) {
            router.replace(checkoutUrl);
            return;
          }

          router.replace(returnTo ?? "/account");
          return;
        }

        if (autoRedirectToShopify) {
          window.location.replace(loginHref);
        }
      })
      .catch(() => {
        if (autoRedirectToShopify) {
          window.location.replace(loginHref);
        }
      });
  }, [
    autoRedirectToShopify,
    checkoutUrl,
    hasBlockingNotice,
    loginHref,
    recentLogout,
    returnTo,
    router,
  ]);

  return (
    <main className="flex-1 max-w-xl mx-auto py-16 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4 mt-16">{copy.auth.signInTitle}</h1>
      {logoutNotice ? (
        <div className="mb-4 rounded border border-yellow-500/40 bg-yellow-900/20 p-3 text-sm text-yellow-100">
          {copy.auth.logoutNotice}
        </div>
      ) : null}
      {checkoutUnavailable ? (
        <div className="mb-4 rounded border border-red-500/40 bg-red-900/20 p-3 text-sm text-red-100">
          {copy.auth.checkoutUnavailable}
        </div>
      ) : null}
      {authSessionExpired ? (
        <div className="mb-4 rounded border border-yellow-500/40 bg-yellow-900/20 p-3 text-sm text-yellow-100">
          {copy.auth.sessionExpired}
        </div>
      ) : null}
      {authInvalidCallback ? (
        <div className="mb-4 rounded border border-red-500/40 bg-red-900/20 p-3 text-sm text-red-100">
          {copy.auth.invalidCallback}
        </div>
      ) : null}
      <p className="mb-6">
        {autoRedirectToShopify
          ? copy.auth.checkoutRedirectHint
          : copy.auth.redirectHint}
      </p>
      {autoRedirectToShopify ? (
        <p className="mb-4 text-sm text-gray-500">
          Weiterleitung zu Shopify...
        </p>
      ) : null}
      <a
        href={loginHref}
        target="_self"
        className="inline-block rounded bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
        rel="noopener noreferrer"
        onClick={(e) => {
          // prevent Next.js client-side navigation which would
          // fetch the API route instead of letting the browser
          // handle the redirect response. Force a hard load.
          e.preventDefault();
          window.location.href = loginHref;
        }}
      >
        {copy.auth.signInWithShopify}
      </a>
    </main>
  );
}

export default function AccountLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
