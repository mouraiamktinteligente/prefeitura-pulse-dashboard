
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { AuthProvider } from "@/hooks/useAuth";
import { useAuth } from "@/contexts/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import MainDashboard from "./pages/MainDashboard";
import DetailedDashboard from "./pages/DetailedDashboard";
import Login from "./pages/Login";
import AuthSetup from "./pages/AuthSetup";
import NotFound from "./pages/NotFound";
import AccessLogs from "./pages/AccessLogs";
import PlatformUsers from "./pages/PlatformUsers";
import ClientRegistration from "./pages/ClientRegistration";
import ClientDetails from "./pages/ClientDetails";
import AnalisePesquisa from "./pages/AnalisePesquisa";
import Marketing from "./pages/Marketing";
import RegistroMovimentacoes from "./pages/RegistroMovimentacoes";
import { RealtimeNotifications } from "@/components/RealtimeNotifications";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      
      <Route path="/auth-setup" element={<AuthSetup />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout>
            <MainDashboard />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/:clientId" element={
        <ProtectedRoute>
          <AppLayout>
            <DetailedDashboard />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/cadastro" element={
        <ProtectedRoute>
          <AppLayout>
            <ClientRegistration />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/gestao-clientes" element={
        <ProtectedRoute>
          <AppLayout>
            <ClientRegistration />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/gestao-clientes/:clientId" element={
        <ProtectedRoute>
          <AppLayout>
            <ClientDetails />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/analise-pesquisa" element={
        <ProtectedRoute>
          <AppLayout>
            <AnalisePesquisa />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/marketing" element={
        <ProtectedRoute>
          <AppLayout>
            <Marketing />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/access-logs" element={
        <ProtectedRoute requireAdmin={true}>
          <AppLayout>
            <AccessLogs />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/platform-users" element={
        <ProtectedRoute requireAdmin={true}>
          <AppLayout>
            <PlatformUsers />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/movimentacoes" element={
        <ProtectedRoute requireAdmin={true}>
          <AppLayout>
            <RegistroMovimentacoes />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/" element={
        user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen flex flex-col w-full">
              <RealtimeNotifications />
              <AppRoutes />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
