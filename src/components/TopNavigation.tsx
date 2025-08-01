
import React from 'react';
import { BarChart3, Megaphone, CheckSquare, UserPlus, LogOut, Shield, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Análise de Pesquisa",
    icon: BarChart3,
    url: "/analise-pesquisa",
  },
  {
    title: "Marketing",
    icon: Megaphone,
    url: "#",
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

export function TopNavigation() {
  const { logout } = useAuth();
  const { userSystem, isAdmin } = useUserPermissions();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
      <Badge variant={variants[userSystem.tipo_usuario as keyof typeof variants] as any}>
        {labels[userSystem.tipo_usuario as keyof typeof labels]}
      </Badge>
    );
  };

  const availableMenuItems = [...menuItems, ...(isAdmin ? adminMenuItems : [])];

  return (
    <header className="bg-blue-800/90 backdrop-blur-sm border-b border-blue-700/50 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo - Agora clicável */}
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
          <img 
            src="/lovable-uploads/22b7d1a7-2484-4be4-ad97-58b9760ac566.png" 
            alt="IA Logo" 
            className="w-12 h-12 object-contain hover:opacity-80 transition-opacity" 
          />
        </div>

        {/* Navigation Menu */}
        <div className="flex items-center space-x-4">
          <NavigationMenu>
            <NavigationMenuList>
              {availableMenuItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  <button
                    onClick={() => navigate(item.url)}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent text-blue-200 hover:bg-blue-700/50 hover:text-white focus:bg-blue-700/50 focus:text-white data-[active]:bg-blue-600 data-[active]:text-white"
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.title}
                  </button>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-3 text-blue-200">
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {userSystem?.nome_completo || 'Usuário'}
                </span>
                {getUserTypeBadge()}
              </div>
              <span className="text-xs text-blue-300">
                {userSystem?.email}
              </span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-blue-200 hover:text-white hover:bg-blue-700/50"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
