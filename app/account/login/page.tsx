"use client";

// ensure this page is never statically prerendered – it relies on client-only
// hooks and should always run in the browser.  prevents build-time errors.
export const dynamic = "force-dynamic";

import LoginPage from "../login/page";

// `/account/login` is the canonical Shopify callback URL.  We make this a
// client component as well so that the request never attempts server rendering
// (avoiding serialization errors entirely).
export default function AccountLoginPage() {
    return <LoginPage />;
}