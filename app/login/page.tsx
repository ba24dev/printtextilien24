import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface LoginPageProps {
    searchParams?: {
        checkout_url?: string;
        [key: string]: string | undefined;
    };
}

export default async function LoginPage({ searchParams = {} }: LoginPageProps) {
    const cookieStore = await cookies();

    // if a checkout_url is provided (Shopify does this when redirecting from
    // the cart/checkouts), preserve it in a cookie so the callback handler can
    // punt the user back there after authentication.
    const rawDest = searchParams.checkout_url;
    if (rawDest) {
        try {
            const dest = decodeURIComponent(rawDest);
            // simple sanitation: ensure it’s a path or same-origin
            if (dest.startsWith("/") || dest.startsWith(cookieStore.get("host") || "")) {
                cookieStore.set("shopify_post_login_redirect", dest, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "lax",
                    path: "/",
                });
            }
        } catch {
            // ignore malformed values
        }
    }

    const token = cookieStore.get("shopify_customer_access_token")?.value;
    if (token) {
        // already signed in; if we recorded a checkout destination, go there
        if (rawDest) {
            const dest = decodeURIComponent(rawDest);
            redirect(dest);
        }
        redirect("/account");
    }

    return (
        <main className="max-w-xl mx-auto py-16 px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Sign in</h1>
            <p className="mb-6">
                You’ll be redirected to Shopify to authenticate your customer account.
            </p>
            <a
                href="/api/auth/customer/login"
                className="inline-block rounded bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
                rel="noopener noreferrer"
            >
                Log in with Shopify
            </a>
        </main>
    );
}
