
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClientMetrics {
  totalComments: number;
  positiveComments: number;
  negativeComments: number;
  neutralComments: number;
}

export const useClientMetrics = (clientInstagram?: string) => {
  const [metrics, setMetrics] = useState<ClientMetrics>({
    totalComments: 0,
    positiveComments: 0,
    negativeComments: 0,
    neutralComments: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMetrics = async () => {
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
            neutralComments: Number(data.neutros) || 0
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
    };

    fetchMetrics();
  }, [clientInstagram, toast]);

  return { metrics, loading };
};
