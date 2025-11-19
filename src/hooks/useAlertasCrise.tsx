import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AlertaCrise {
  id: number;
  instagram_prefeitura: string | null;
  instagram_prefeito: string | null;
  resumo: string | null;
  origem: string | null;
  created_at: string;
  alerta_visualizado: boolean | null;
  hora_acao: string | null;
  sentiment_score: number | null;
  tema: string | null;
  prefeitura: string | null;
  prefeito: string | null;
  acao_tomada?: string;
}

// Buscar alertas ativos (não visualizados) de um cliente específico
export const useAlertasAtivos = (instagramPrefeitura?: string, instagramPrefeito?: string) => {
  return useQuery({
    queryKey: ['alertas-ativos', instagramPrefeitura, instagramPrefeito],
    queryFn: async () => {
      if (!instagramPrefeitura && !instagramPrefeito) {
        return [];
      }

      let query = supabase
        .from('alerta_crise_notificacao')
        .select('*')
        .eq('alerta_visualizado', false)
        .order('created_at', { ascending: false });

      // Buscar por prefeitura ou prefeito
      if (instagramPrefeitura && instagramPrefeito) {
        query = query.or(`instagram_prefeitura.eq.${instagramPrefeitura},instagram_prefeito.eq.${instagramPrefeito}`);
      } else if (instagramPrefeitura) {
        query = query.eq('instagram_prefeitura', instagramPrefeitura);
      } else if (instagramPrefeito) {
        query = query.eq('instagram_prefeito', instagramPrefeito);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as AlertaCrise[];
    },
    enabled: !!(instagramPrefeitura || instagramPrefeito)
  });
};

// Buscar todos os alertas (para página de histórico)
export const useAlertasCriseMes = (
  mes?: number, 
  ano?: number, 
  instagramPrefeitura?: string | null,
  instagramPrefeito?: string | null
) => {
  return useQuery({
    queryKey: ['alertas-mes', mes, ano, instagramPrefeitura, instagramPrefeito],
    queryFn: async () => {
      let query = supabase
        .from('alerta_crise_notificacao')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Filtrar por perfis da prefeitura (se fornecidos)
      if (instagramPrefeitura || instagramPrefeito) {
        const conditions = [];
        if (instagramPrefeitura) conditions.push(`instagram_prefeitura.eq.${instagramPrefeitura}`);
        if (instagramPrefeito) conditions.push(`instagram_prefeito.eq.${instagramPrefeito}`);
        query = query.or(conditions.join(','));
      }
      
      // Se mes e ano forem especificados, filtrar
      if (mes && ano) {
        const startDate = new Date(ano, mes - 1, 1).toISOString();
        const endDate = new Date(ano, mes, 0, 23, 59, 59).toISOString();
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      } else {
        // Mês atual por padrão
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        query = query.gte('created_at', startDate);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as AlertaCrise[];
    },
    enabled: !!(instagramPrefeitura || instagramPrefeito) // Só executa se houver perfis para filtrar
  });
};

// Marcar alerta como visualizado e salvar ação
export const useMarcarAlertaVisualizado = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      alertaId, 
      acaoTomada 
    }: { 
      alertaId: number; 
      acaoTomada: string;
    }) => {
      const { data, error } = await supabase
        .from('alerta_crise_notificacao')
        .update({
          alerta_visualizado: true,
          hora_acao: new Date().toISOString(),
          acao_tomada: acaoTomada
        })
        .eq('id', alertaId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas-ativos'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-mes'] });
      toast({
        title: "Ação registrada com sucesso!",
        description: "O alerta foi marcado como visualizado.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao registrar ação",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Calcular tempo de resposta
export const calcularTempoResposta = (createdAt: string, horaAcao: string | null): string => {
  if (!horaAcao) return 'Aguardando resposta';
  
  const inicio = new Date(createdAt);
  const fim = new Date(horaAcao);
  const diffMs = fim.getTime() - inicio.getTime();
  
  const horas = Math.floor(diffMs / (1000 * 60 * 60));
  const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (horas > 24) {
    const dias = Math.floor(horas / 24);
    const horasRestantes = horas % 24;
    return `${dias}d ${horasRestantes}h ${minutos}m`;
  }
  
  return `${horas}h ${minutos}m`;
};