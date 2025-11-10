import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { supabase } from "@/integrations/supabase/client";

interface BreadcrumbSegment {
  label: string;
  path?: string;
}

export function DynamicBreadcrumbs() {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const [clientName, setClientName] = useState<string>("");

  // Buscar nome do cliente se houver clientId na URL
  useEffect(() => {
    const fetchClientName = async () => {
      if (params.clientId) {
        try {
          const { data, error } = await supabase
            .from('clientes' as any)
            .select('nome_completo')
            .eq('id', params.clientId)
            .single();
          
          if (data && !error && (data as any).nome_completo) {
            setClientName((data as any).nome_completo);
          }
        } catch (err) {
          console.error('Erro ao buscar nome do cliente:', err);
        }
      }
    };

    fetchClientName();
  }, [params.clientId]);

  // Mapear rotas para breadcrumbs
  const getBreadcrumbs = (): BreadcrumbSegment[] => {
    const segments: BreadcrumbSegment[] = [
      { label: "Dashboard", path: "/dashboard" }
    ];

    const path = location.pathname;

    // Dashboard principal
    if (path === "/dashboard") {
      return segments;
    }

    // Dashboard detalhado de cliente
    if (path.startsWith("/dashboard/") && params.clientId) {
      segments.push({
        label: clientName || "Carregando...",
      });
      return segments;
    }

    // Gestão de Clientes
    if (path === "/gestao-clientes") {
      segments.push({ label: "Gestão de Clientes" });
      return segments;
    }

    // Detalhes do cliente na gestão
    if (path.startsWith("/gestao-clientes/") && params.clientId) {
      segments.push({ label: "Gestão de Clientes", path: "/gestao-clientes" });
      segments.push({ label: clientName || "Carregando..." });
      return segments;
    }

    // Cadastro
    if (path === "/cadastro") {
      segments.push({ label: "Cadastro de Cliente" });
      return segments;
    }

    // Análise de Pesquisa
    if (path === "/analise-pesquisa") {
      segments.push({ label: "Análise de Pesquisa" });
      return segments;
    }

    // Marketing
    if (path === "/marketing") {
      segments.push({ label: "Marketing" });
      return segments;
    }

    // Admin - Platform Users
    if (path === "/admin/platform-users") {
      segments.push({ label: "Administração", path: "/admin/platform-users" });
      segments.push({ label: "Usuários da Plataforma" });
      return segments;
    }

    // Admin - Access Logs
    if (path === "/admin/access-logs") {
      segments.push({ label: "Administração", path: "/admin/access-logs" });
      segments.push({ label: "Logs de Acesso" });
      return segments;
    }

    // Admin - Movimentações
    if (path === "/admin/movimentacoes") {
      segments.push({ label: "Administração", path: "/admin/movimentacoes" });
      segments.push({ label: "Registro de Movimentações" });
      return segments;
    }

    return segments;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1 text-blue-200 hover:text-white cursor-pointer transition-colors"
          >
            <Home className="w-4 h-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.map((segment, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <div key={index} className="flex items-center gap-1.5">
              <BreadcrumbSeparator className="text-blue-400" />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-white font-medium">
                    {segment.label}
                  </BreadcrumbPage>
                ) : segment.path ? (
                  <BreadcrumbLink
                    onClick={() => navigate(segment.path!)}
                    className="text-blue-200 hover:text-white cursor-pointer transition-colors"
                  >
                    {segment.label}
                  </BreadcrumbLink>
                ) : (
                  <span className="text-blue-200">{segment.label}</span>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
