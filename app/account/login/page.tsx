import LoginPage from "../login/page";

// `/account/login` is the canonical URL Shopify uses when redirecting from
// cart/checkouts.  Instead of bouncing to `/login`, we render the same
// component directly so the link matches exactly what Shopify expects.
// The shared page already understands `searchParams` (including
// `checkout_url`), so this wrapper simply forwards props.
export default function AccountLoginPage(props: { searchParams?: Record<string, string> }) {
    return <LoginPage {...props} />;
}