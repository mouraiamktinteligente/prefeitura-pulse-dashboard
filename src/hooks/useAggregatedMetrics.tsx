
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AggregatedMetrics {
  totalComments: number;
  positiveComments: number;
  negativeComments: number;
  neutralComments: number;
}

export const useAggregatedMetrics = () => {
  const [metrics, setMetrics] = useState<AggregatedMetrics>({
    totalComments: 0,
    positiveComments: 0,
    negativeComments: 0,
    neutralComments: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAggregatedMetrics = async () => {
      try {
        console.log('Buscando métricas agregadas de todos os perfis');

        const { data, error } = await supabase
          .from('resumo_sentimento_por_profile')
          .select('total_comentarios, positivos, negativos, neutros');

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
          
          // Soma todos os valores de todos os perfis
          const aggregated = data.reduce((acc, curr) => ({
            totalComments: acc.totalComments + (Number(curr.total_comentarios) || 0),
            positiveComments: acc.positiveComments + (Number(curr.positivos) || 0),
            negativeComments: acc.negativeComments + (Number(curr.negativos) || 0),
            neutralComments: acc.neutralComments + (Number(curr.neutros) || 0)
          }), {
            totalComments: 0,
            positiveComments: 0,
            negativeComments: 0,
            neutralComments: 0
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
    };

    fetchAggregatedMetrics();
  }, [toast]);

  return { metrics, loading };
};
