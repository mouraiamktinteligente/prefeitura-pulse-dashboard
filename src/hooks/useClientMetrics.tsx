
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClientMetrics {
  totalComments: number;
  positiveComments: number;
  negativeComments: number;
  neutralComments: number;
  lastActivity: string | null;
}

export const useClientMetrics = (clientInstagram?: string) => {
  const [metrics, setMetrics] = useState<ClientMetrics>({
    totalComments: 0,
    positiveComments: 0,
    negativeComments: 0,
    neutralComments: 0,
    lastActivity: null
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMetrics = useCallback(async () => {
      if (!clientInstagram) {
        setLoading(false);
        return;
      }

      try {
        console.log('Buscando métricas para o perfil:', clientInstagram);

        const { data, error } = await supabase
          .from('resumo_sentimento_por_profile')
          .select('*')
          .eq('profile', clientInstagram)
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar métricas:', error);
          toast({
            title: "Erro ao carregar métricas",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        if (data) {
          console.log('Dados encontrados:', data);
          setMetrics({
            totalComments: Number(data.total_comentarios) || 0,
            positiveComments: Number(data.positivos) || 0,
            negativeComments: Number(data.negativos) || 0,
            neutralComments: Number(data.neutros) || 0,
            lastActivity: data.ultima_atividade || null
          });
        } else {
          console.log('Nenhum dado encontrado para o perfil:', clientInstagram);
          // Mantém os valores zerados se não encontrar dados
        }
      } catch (error) {
        console.error('Erro inesperado ao buscar métricas:', error);
        toast({
          title: "Erro inesperado",
          description: "Erro ao carregar métricas do cliente",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }, [clientInstagram, toast]);

  // Real-time listener para atualizações de comentários
  useEffect(() => {
    if (!clientInstagram) return;

    const channel = supabase
      .channel('metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analysis-comments',
          filter: `profile=eq.${clientInstagram}`
        },
        (payload) => {
          console.log('📡 Comentário atualizado em tempo real para perfil:', clientInstagram, payload);
          
          // Re-buscar métricas quando houver mudanças
          fetchMetrics();
          
          // Mostrar toast quando dados forem atualizados
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Novo comentário analisado!",
              description: `Novas métricas disponíveis para ${clientInstagram}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientInstagram, toast, fetchMetrics]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading };
};
