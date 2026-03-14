import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate("/dashboard", { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message === "Invalid login credentials"
            ? "E-mail ou senha incorretos"
            : error.message);
          return;
        }
        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
      } else {
        const { error } = await signUp(email, password, name);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Conta criada com sucesso! Verifique seu e-mail.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl text-foreground">CopyHunter</span>
          </a>
          <h1 className="text-2xl font-bold text-foreground">
            {isLogin ? "Entrar na sua conta" : "Criar sua conta"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLogin ? "Bem-vindo de volta!" : "Comece a gerar copies em segundos"}
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-premium p-6">
          <div className="flex rounded-md bg-muted p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 text-sm font-medium py-2 rounded-md transition-all duration-150 ${
                isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 text-sm font-medium py-2 rounded-md transition-all duration-150 ${
                !isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-foreground">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-11 bg-background"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-foreground">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 h-11 bg-background"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 h-11 bg-background"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-150"
            >
              {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta grátis"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
