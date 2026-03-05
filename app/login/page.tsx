"use client";

export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";

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

function LoginClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const reason = searchParams.get("reason");
    const logoutNotice = searchParams.get("logout") === "1";
    const checkoutUnavailable =
        reason === "checkout_unavailable" ||
        searchParams.get("checkout_error") === "1";
    const authSessionExpired = reason === "auth_session_expired";
    const authInvalidCallback = reason === "auth_invalid_callback";
    const checkoutUrl = useMemo(
        () => getSafeCheckoutUrl(searchParams.get("checkout_url")),
        [searchParams],
    );
    const loginHref = checkoutUrl
        ? `/api/auth/customer/login?checkout_url=${encodeURIComponent(checkoutUrl)}`
        : "/api/auth/customer/login";

    // if already logged in, send straight to account/checkouts
    useEffect(() => {
        if (logoutNotice) return;
        fetch("/api/customer/session", { credentials: "include" })
            .then((res) => res.json())
            .then((sess) => {
                if (sess?.loggedIn) {
                    if (checkoutUrl) {
                        if (checkoutUrl.startsWith("http://") || checkoutUrl.startsWith("https://")) {
                            window.location.href = checkoutUrl;
                            return;
                        }
                        router.replace(checkoutUrl);
                    } else {
                        router.replace("/account");
                    }
                }
            })
            .catch(() => { });
    }, [checkoutUrl, logoutNotice, router]);

    return (
        <main className="flex-1 max-w-xl mx-auto py-16 px-4 text-center">
            <h1 className="text-4xl font-bold mb-4 mt-16">Sign in</h1>
            {logoutNotice ? (
                <div className="mb-4 rounded border border-yellow-500/40 bg-yellow-900/20 p-3 text-sm text-yellow-100">
                    This signs you out of this site. On shared devices, provider sessions can still exist.
                    Click the button below to re-authenticate explicitly.
                </div>
            ) : null}
            {checkoutUnavailable ? (
                <div className="mb-4 rounded border border-red-500/40 bg-red-900/20 p-3 text-sm text-red-100">
                    Your previous checkout session is no longer available. Please reopen checkout from your cart.
                </div>
            ) : null}
            {authSessionExpired ? (
                <div className="mb-4 rounded border border-yellow-500/40 bg-yellow-900/20 p-3 text-sm text-yellow-100">
                    Your sign-in session expired. Please click the login button again.
                </div>
            ) : null}
            {authInvalidCallback ? (
                <div className="mb-4 rounded border border-red-500/40 bg-red-900/20 p-3 text-sm text-red-100">
                    Invalid authentication callback. Please restart login.
                </div>
            ) : null}
            <p className="mb-6">
                You’ll be redirected to Shopify to authenticate your customer account.
            </p>
            <a
                href={loginHref}
                target="_self"
                className="inline-block rounded bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
                rel="noopener noreferrer"
                onClick={(e) => {
                    // prevent Next.js client-side navigation which would
                    // fetch the API route instead of letting the browser
                    // handle the redirect response.  Force a hard load.
                    e.preventDefault();
                    window.location.href = loginHref;
                }}
            >
                Log in with Shopify
            </a>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginClient />
        </Suspense>
    );
}
