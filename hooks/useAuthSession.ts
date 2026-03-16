import { useEffect, useState } from "react";

export function useAuthSession() {
  const [session, setSession] = useState<{
    loggedIn: boolean;
    email?: string | null;
    customerId?: string;
    tags?: string[];
  } | null>(null);

  useEffect(() => {
    const loadSession = () =>
      fetch("/api/customer/session", {
        credentials: "include",
        cache: "no-store",
      })
      .then((res) => res.json())
      .then(setSession)
      .catch(() => setSession({ loggedIn: false }));

    void loadSession();
    window.addEventListener("focus", loadSession);
    return () => {
      window.removeEventListener("focus", loadSession);
    };
  }, []);

  return session;
}
