
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
            <AppSidebar />
            <SidebarInset className="flex-1">
              <header className="flex h-16 shrink-0 items-center gap-2 border-b border-blue-700/20 bg-blue-900/50 backdrop-blur-sm px-4">
                <SidebarTrigger className="text-white hover:bg-blue-800/50" />
                <div className="flex items-center space-x-2">
                  <h1 className="text-white font-semibold">Sistema de Gestão Municipal</h1>
                </div>
              </header>
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/pesquisa" element={<div className="p-6 text-white">Análise de Pesquisa - Em desenvolvimento</div>} />
                  <Route path="/marketing" element={<div className="p-6 text-white">Marketing - Em desenvolvimento</div>} />
                  <Route path="/tarefas" element={<div className="p-6 text-white">Gestão de Tarefas - Em desenvolvimento</div>} />
                  <Route path="/cadastro" element={<div className="p-6 text-white">Cadastro - Em desenvolvimento</div>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
