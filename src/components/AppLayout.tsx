import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Menu } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header com botão de toggle do sidebar */}
          <header className="bg-blue-800/90 backdrop-blur-sm border-b border-blue-700/50 px-4 py-3 sticky top-0 z-10">
            <SidebarTrigger className="text-white hover:bg-blue-700/50 rounded-md p-2 transition-colors">
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
          </header>
          
          {/* Conteúdo principal */}
          <main className="flex-1 bg-blue-900">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
