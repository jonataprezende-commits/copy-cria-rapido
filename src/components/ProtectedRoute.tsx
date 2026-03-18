import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-muted-foreground text-sm">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current location to redirect back after login
    return <Navigate to="/entrar" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
