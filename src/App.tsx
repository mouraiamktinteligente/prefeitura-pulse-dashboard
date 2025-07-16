
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TopNavigation } from "@/components/TopNavigation";
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
          <TopNavigation />
          <main className="flex-1">
            <MainDashboard />
          </main>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/:clientId" element={
        <ProtectedRoute>
          <TopNavigation />
          <main className="flex-1">
            <DetailedDashboard />
          </main>
        </ProtectedRoute>
      } />
      
      <Route path="/cadastro" element={
        <ProtectedRoute>
          <TopNavigation />
          <main className="flex-1">
            <ClientRegistration />
          </main>
        </ProtectedRoute>
      } />
      
      <Route path="/gestao-clientes" element={
        <ProtectedRoute>
          <TopNavigation />
          <main className="flex-1">
            <ClientRegistration />
          </main>
        </ProtectedRoute>
      } />
      
      <Route path="/gestao-clientes/:clientId" element={
        <ProtectedRoute>
          <TopNavigation />
          <main className="flex-1">
            <ClientDetails />
          </main>
        </ProtectedRoute>
      } />
      
      <Route path="/analise-pesquisa" element={
        <ProtectedRoute>
          <TopNavigation />
          <main className="flex-1">
            <AnalisePesquisa />
          </main>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/access-logs" element={
        <ProtectedRoute requireAdmin={true}>
          <TopNavigation />
          <main className="flex-1">
            <AccessLogs />
          </main>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/platform-users" element={
        <ProtectedRoute requireAdmin={true}>
          <TopNavigation />
          <main className="flex-1">
            <PlatformUsers />
          </main>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/movimentacoes" element={
        <ProtectedRoute requireAdmin={true}>
          <TopNavigation />
          <main className="flex-1">
            <RegistroMovimentacoes />
          </main>
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
