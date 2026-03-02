import { useEffect, useState } from "react";

export function useAuthSession() {
  const [session, setSession] = useState<{
    loggedIn: boolean;
    email?: string;
  } | null>(null);
  useEffect(() => {
    fetch("/api/customer/session")
      .then((res) => res.json())
      .then(setSession)
      .catch(() => setSession({ loggedIn: false }));
  }, []);
  return session;
}
