import { type AdapterSession, type AdapterUser } from "@auth/core/adapters";
import { useQuery } from "@tanstack/react-query";

export const AUTH_SESSION_QUERY_KEY = ["@AUTH_SESSION"] as const;

export const useSession = () => {
  const { data, status } = useQuery({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const session = (await res.json()) as ({ user: AdapterUser } & AdapterSession) | null;

      if (!session?.user) {
        return null;
      }

      return session;
    },
  });

  return { session: data, status };
};
