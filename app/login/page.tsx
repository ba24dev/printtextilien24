import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function getSession() {
    const res = await fetch("/api/customer/session", {
        headers: {
            Cookie: cookies().toString(),
        },
        cache: "no-store",
    });
    if (!res.ok) return { loggedIn: false };
    return res.json();
}

export default async function LoginPage() {
    const session = await getSession();
    if (session?.loggedIn) {
        // already signed in, send them to their account
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
