import LoginPage from "../login/page";

// `/account/login` is the canonical URL Shopify uses when redirecting from
// cart/checkouts.  We don’t forward any props because the client component
// already reads `useSearchParams()` itself; passing the `searchParams` object
// would include a `get()` function which cannot be serialized and causes the
// runtime error seen in production.
export default function AccountLoginPage() {
    return <LoginPage />;
}