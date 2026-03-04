"use client";

export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";

function getSafeCheckoutPath(raw: string | null): string | null {
    if (!raw) return null;
    const value = raw.trim();
    if (!value.startsWith("/") || value.startsWith("//")) {
        return null;
    }
    return value;
}

function LoginClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const checkoutPath = useMemo(
        () => getSafeCheckoutPath(searchParams.get("checkout_url")),
        [searchParams],
    );
    const loginHref = checkoutPath
        ? `/api/auth/customer/login?checkout_url=${encodeURIComponent(checkoutPath)}`
        : "/api/auth/customer/login";

    // if already logged in, send straight to account/checkouts
    useEffect(() => {
        fetch("/api/customer/session", { credentials: "include" })
            .then((res) => res.json())
            .then((sess) => {
                if (sess?.loggedIn) {
                    if (checkoutPath) {
                        router.replace(checkoutPath);
                    } else {
                        router.replace("/account");
                    }
                }
            })
            .catch(() => { });
    }, [checkoutPath, router]);

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
