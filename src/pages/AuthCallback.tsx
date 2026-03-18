import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        toast.error(`Erro na autenticação: ${error.message}`);
        navigate('/login', { replace: true });
        return;
      }

      if (data.session) {
        navigate('/dashboard', { replace: true });
      } else {
        // This might happen if the session is not immediately available, or if there's an issue
        // Supabase's onAuthStateChange should eventually handle this, but a fallback to login is safe.
        navigate('/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-foreground">Redirecionando...</p>
    </div>
  );
};

export default AuthCallback;
