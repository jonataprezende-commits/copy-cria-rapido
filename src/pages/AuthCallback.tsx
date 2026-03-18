import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          toast.error(`Erro na autenticação: ${error.message}`);
          navigate('/entrar', { replace: true });
          return;
        }

        if (data.session) {
          console.log("Session found in callback, redirecting to dashboard");
          navigate('/dashboard', { replace: true });
        } else {
          console.warn("No session found in callback, checking again in 1s...");
          // Sometimes session takes a moment to propagate
          setTimeout(async () => {
            const { data: retryData } = await supabase.auth.getSession();
            if (retryData.session) {
              navigate('/dashboard', { replace: true });
            } else {
              navigate('/entrar', { replace: true });
            }
          }, 1000);
        }
      } catch (err) {
        console.error("Unexpected error in auth callback:", err);
        navigate('/entrar', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-foreground font-medium">Finalizando autenticação...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
