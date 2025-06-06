
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Megaphone, 
  CheckSquare, 
  UserPlus,
  Home
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { 
    title: 'Dashboard', 
    url: '/', 
    icon: Home 
  },
  { 
    title: 'Análise de Pesquisa', 
    url: '/pesquisa', 
    icon: BarChart3 
  },
  { 
    title: 'Marketing', 
    url: '/marketing', 
    icon: Megaphone 
  },
  { 
    title: 'Gestão de Tarefas', 
    url: '/tarefas', 
    icon: CheckSquare 
  },
  { 
    title: 'Cadastro', 
    url: '/cadastro', 
    icon: UserPlus 
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="border-r border-blue-700/20 bg-blue-900/95 backdrop-blur-sm">
      <SidebarHeader className="p-4 border-b border-blue-700/20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-white">🏛️</span>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-white font-semibold text-sm">Prefeitura SP</h2>
              <p className="text-blue-300 text-xs">Plataforma Digital</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-300 text-xs font-medium px-3 py-2">
            {!isCollapsed && 'Menu Principal'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-blue-800/50 data-[active=true]:bg-blue-700 data-[active=true]:text-white">
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => 
                        `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-700 text-white' 
                            : 'text-blue-300 hover:text-white hover:bg-blue-800/50'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
