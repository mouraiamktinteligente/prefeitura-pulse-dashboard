
import { BarChart3, Megaphone, CheckSquare, UserPlus } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";

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
    title: "Cadastro",
    icon: UserPlus,
    url: "/cadastro",
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className="border-r border-blue-700/50 bg-blue-800/90 backdrop-blur-sm">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-white font-semibold text-sm">Dashboard</h2>
              <p className="text-blue-300 text-xs">Gestão Municipal</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-300 font-medium">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="text-blue-200 hover:bg-blue-700/50 hover:text-white data-[active=true]:bg-blue-600 data-[active=true]:text-white"
                  >
                    <a href={item.url} className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </a>
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
