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
    const checkoutUrl = useMemo(
        () => getSafeCheckoutUrl(searchParams.get("checkout_url")),
        [searchParams],
    );
    const loginHref = checkoutUrl
        ? `/api/auth/customer/login?checkout_url=${encodeURIComponent(checkoutUrl)}`
        : "/api/auth/customer/login";

    // if already logged in, send straight to account/checkouts
    useEffect(() => {
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
    }, [checkoutUrl, router]);

    return (
        <main className="flex-1 max-w-xl mx-auto py-16 px-4 text-center">
            <h1 className="text-4xl font-bold mb-4 mt-16">Sign in</h1>
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
