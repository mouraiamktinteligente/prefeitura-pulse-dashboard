import { BarChart3, Megaphone, CheckSquare, UserPlus, FileText, Home, Users, Shield, LogOut, AlertTriangle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AccessNotifications } from "@/components/AccessNotifications";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/dashboard",
  },
  {
    title: "Análise de Pesquisa",
    icon: BarChart3,
    url: "/analise-pesquisa",
  },
  {
    title: "Marketing",
    icon: Megaphone,
    url: "/marketing",
  },
  {
    title: "Alertas de Crise",
    icon: AlertTriangle,
    url: "/alertas-crise",
  },
  {
    title: "Gestão de tarefas",
    icon: CheckSquare,
    url: "#",
  },
  {
    title: "Gestão de Clientes",
    icon: UserPlus,
    url: "/gestao-clientes",
  },
];

const adminMenuItems = [
  {
    title: "Usuários da Plataforma",
    icon: Users,
    url: "/admin/platform-users",
  },
  {
    title: "Logs de Acesso",
    icon: Shield,
    url: "/admin/access-logs",
  },
  {
    title: "Registro de movimentações",
    icon: FileText,
    url: "/admin/movimentacoes",
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { userSystem, isAdmin } = useUserPermissions();

  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname.startsWith("/dashboard/");
    }
    if (url === "/gestao-clientes") {
      return location.pathname === "/gestao-clientes" || location.pathname.startsWith("/gestao-clientes/");
    }
    return location.pathname === url;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const availableMenuItems = [...menuItems, ...(isAdmin ? adminMenuItems : [])];

  const getUserTypeBadge = () => {
    if (!userSystem) return null;
    
    const variants = {
      administrador: 'default',
      usuario: 'secondary',
      cliente: 'outline'
    };
    
    const labels = {
      administrador: 'Admin',
      usuario: 'Usuário',
      cliente: 'Cliente'
    };

    return (
      <Badge variant={variants[userSystem.tipo_usuario as keyof typeof variants] as any} className="text-xs">
        {labels[userSystem.tipo_usuario as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <Sidebar className="border-r border-blue-700/50 bg-blue-800/90 backdrop-blur-sm">
      <SidebarHeader className="p-4">
        <div 
          className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-16 h-16 flex items-center justify-center">
            <img 
              src="/lovable-uploads/22b7d1a7-2484-4be4-ad97-58b9760ac566.png" 
              alt="MourIA Logo" 
              className="w-16 h-16 object-contain" 
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="sidebar-scroll">
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-300 font-medium">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {availableMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => item.url !== "#" && navigate(item.url)}
                    className={cn(
                      "text-blue-200 hover:bg-blue-700/50 hover:text-white cursor-pointer transition-colors",
                      isActive(item.url) && "bg-blue-600 text-white font-medium",
                      item.url === "#" && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={item.url === "#"}
                  >
                    <item.icon className="w-5 h-5" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-blue-700/50">
        {!isCollapsed ? (
          <div className="space-y-3">
            {isAdmin && (
              <div className="flex items-center justify-center pb-2">
                <AccessNotifications />
              </div>
            )}
            <div className="text-blue-200">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-medium truncate">
                  {userSystem?.nome_completo || 'Usuário'}
                </span>
                {getUserTypeBadge()}
              </div>
              <span className="text-xs text-blue-300 truncate block">
                {userSystem?.email}
              </span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-blue-200 hover:text-white hover:bg-blue-700/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {isAdmin && <AccessNotifications />}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="w-full justify-center text-blue-200 hover:text-white hover:bg-blue-700/50"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
