import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AccountLogoutPage() {
  redirect("/api/auth/customer/logout");
}
