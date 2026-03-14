import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Historico from "./pages/Historico.tsx";
import Salvos from "./pages/Salvos.tsx";
import Exportar from "./pages/Exportar.tsx";
import Configuracoes from "./pages/Configuracoes.tsx";
import Analisar from "./pages/Analisar.tsx";
import Reescrever from "./pages/Reescrever.tsx";
import Campanha from "./pages/Campanha.tsx";
import Treinar from "./pages/Treinar.tsx";
import Funil from "./pages/Funil.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/entrar" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
            <Route path="/salvos" element={<ProtectedRoute><Salvos /></ProtectedRoute>} />
            <Route path="/exportar" element={<ProtectedRoute><Exportar /></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
            <Route path="/analisar" element={<ProtectedRoute><Analisar /></ProtectedRoute>} />
            <Route path="/reescrever" element={<ProtectedRoute><Reescrever /></ProtectedRoute>} />
            <Route path="/campanha" element={<ProtectedRoute><Campanha /></ProtectedRoute>} />
            <Route path="/treinar" element={<ProtectedRoute><Treinar /></ProtectedRoute>} />
            <Route path="/funil" element={<ProtectedRoute><Funil /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
