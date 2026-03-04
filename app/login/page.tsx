"use client";

export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function LoginClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // preserve checkout_url in a regular cookie; callback handler will
    // still read it server-side from the same cookie.
    useEffect(() => {
        const rawDest = searchParams.get("checkout_url");
        if (rawDest) {
            try {
                const dest = decodeURIComponent(rawDest);
                // basic sanitization: only keep path-like values
                if (dest.startsWith("/")) {
                    document.cookie = `shopify_post_login_redirect=${encodeURIComponent(
                        dest,
                    )};path=/;max-age=300;SameSite=Lax`;
                }
            } catch {
                // skip malformed
            }
        }
    }, [searchParams]);

    // if already logged in, send straight to account/checkouts
    useEffect(() => {
        fetch("/api/customer/session", { credentials: "include" })
            .then((res) => res.json())
            .then((sess) => {
                if (sess?.loggedIn) {
                    const dest = searchParams.get("checkout_url");
                    if (dest) {
                        router.replace(dest);
                    } else {
                        router.replace("/account");
                    }
                }
            })
            .catch(() => { });
    }, [router, searchParams]);

    return (
        <main className="flex-1 max-w-xl mx-auto py-16 px-4 text-center">
            <h1 className="text-4xl font-bold mb-4 mt-16">Sign in</h1>
            <p className="mb-6">
                You’ll be redirected to Shopify to authenticate your customer account.
            </p>
            <a
                href="/api/auth/customer/login"
                target="_self"
                className="inline-block rounded bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
                rel="noopener noreferrer"
                onClick={(e) => {
                    // prevent Next.js client-side navigation which would
                    // fetch the API route instead of letting the browser
                    // handle the redirect response.  Force a hard load.
                    e.preventDefault();
                    window.location.href = "/api/auth/customer/login";
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
