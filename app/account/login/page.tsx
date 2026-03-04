import { redirect } from "next/navigation";

// simply forward any request here to the actual login page.  avoids all
// prerendering/client issues by keeping this route server‑side.
export const dynamic = "force-dynamic";

export default function AccountLoginPage() {
  redirect("/login");
}