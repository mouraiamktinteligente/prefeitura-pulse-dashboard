
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AggregatedMetrics {
  totalComments: number;
  positiveComments: number;
  negativeComments: number;
  neutralComments: number;
  lastActivity: string | null;
}

export const useAggregatedMetrics = () => {
  const [metrics, setMetrics] = useState<AggregatedMetrics>({
    totalComments: 0,
    positiveComments: 0,
    negativeComments: 0,
    neutralComments: 0,
    lastActivity: null
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAggregatedMetrics = useCallback(async () => {
      try {
        console.log('Buscando métricas agregadas de todos os perfis');

        const { data, error } = await supabase
          .from('resumo_sentimento_por_profile')
          .select('total_comentarios, positivos, negativos, neutros, ultima_atividade');

        if (error) {
          console.error('Erro ao buscar métricas agregadas:', error);
          toast({
            title: "Erro ao carregar métricas",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        if (data && data.length > 0) {
          console.log('Dados agregados encontrados:', data);
          
          // Soma todos os valores de todos os perfis e encontra a última atividade mais recente
          const aggregated = data.reduce((acc, curr) => {
            const lastActivity = curr.ultima_atividade;
            return {
              totalComments: acc.totalComments + (Number(curr.total_comentarios) || 0),
              positiveComments: acc.positiveComments + (Number(curr.positivos) || 0),
              negativeComments: acc.negativeComments + (Number(curr.negativos) || 0),
              neutralComments: acc.neutralComments + (Number(curr.neutros) || 0),
              lastActivity: !acc.lastActivity || (lastActivity && lastActivity > acc.lastActivity) 
                ? lastActivity 
                : acc.lastActivity
            };
          }, {
            totalComments: 0,
            positiveComments: 0,
            negativeComments: 0,
            neutralComments: 0,
            lastActivity: null as string | null
          });

          setMetrics(aggregated);
        } else {
          console.log('Nenhum dado encontrado para métricas agregadas');
          // Mantém os valores zerados se não encontrar dados
        }
      } catch (error) {
        console.error('Erro inesperado ao buscar métricas agregadas:', error);
        toast({
          title: "Erro inesperado",
          description: "Erro ao carregar métricas agregadas",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }, [toast]);

  // Real-time listener para atualizações agregadas
  useEffect(() => {
    const channel = supabase
      .channel('aggregated-metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analysis-comments'
        },
        (payload) => {
          console.log('📡 Comentário atualizado em tempo real (agregado):', payload);
          
          // Re-buscar métricas agregadas quando houver mudanças
          fetchAggregatedMetrics();
          
          // Mostrar toast quando dados forem atualizados
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Novas análises disponíveis!",
              description: "Dashboard atualizado com novos dados",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, fetchAggregatedMetrics]);

  useEffect(() => {
    fetchAggregatedMetrics();
  }, [fetchAggregatedMetrics]);

  return { metrics, loading };
};
