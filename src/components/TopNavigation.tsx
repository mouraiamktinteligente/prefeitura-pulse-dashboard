
import React from 'react';
import { BarChart3, Megaphone, CheckSquare, UserPlus, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
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
    url: "#",
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
    title: "Cadastro",
    icon: UserPlus,
    url: "#",
  },
  {
    title: "Logs de Acesso",
    icon: Shield,
    url: "/admin/access-logs",
  },
];

export function TopNavigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-blue-800/90 backdrop-blur-sm border-b border-blue-700/50 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Dashboard</h1>
            <p className="text-blue-300 text-xs">Moura IA Marketing Inteligente</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex items-center space-x-4">
          <NavigationMenu>
            <NavigationMenuList>
              {menuItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuLink
                    href={item.url}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent text-blue-200 hover:bg-blue-700/50 hover:text-white focus:bg-blue-700/50 focus:text-white data-[active]:bg-blue-600 data-[active]:text-white"
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.title}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-2 text-blue-200">
            <span className="text-sm">{user?.email}</span>
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
