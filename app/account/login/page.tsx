import { redirect } from "next/navigation";

// simply forward any request here to the actual login page.  avoids all
// prerendering/client issues by keeping this route server‑side.
export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

export function buildAccountLoginRedirect(searchParams?: SearchParams): string {
  const query = new URLSearchParams();
  if (!searchParams) return "/login";

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      query.append(key, value);
      continue;
    }
    if (Array.isArray(value)) {
      for (const v of value) {
        query.append(key, v);
      }
    }
  }

  const qs = query.toString();
  return qs ? `/login?${qs}` : "/login";
}

type AccountLoginPageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function AccountLoginPage({ searchParams }: AccountLoginPageProps) {
  const resolved = searchParams ? await searchParams : undefined;
  redirect(buildAccountLoginRedirect(resolved));
}
