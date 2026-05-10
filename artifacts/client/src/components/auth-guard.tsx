import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Spinner } from "@/components/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const token = typeof window !== "undefined" ? localStorage.getItem("traveloop_token") : null;

  const { data: user, isLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
      queryKey: getGetMeQueryKey(),
    }
  });

  useEffect(() => {
    if (!token || isError) {
      if (isError) {
        localStorage.removeItem("traveloop_token");
        queryClient.removeQueries({ queryKey: getGetMeQueryKey() });
      }
      setLocation("/login");
    }
  }, [token, isError, setLocation, queryClient]);

  if (isLoading || (!user && token)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
