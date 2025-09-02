import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DualClientMetrics {
  prefeito: {
    totalComments: number;
    positiveComments: number;
    negativeComments: number;
    neutralComments: number;
    lastActivity: string | null;
  };
  prefeitura: {
    totalComments: number;
    positiveComments: number;
    negativeComments: number;
    neutralComments: number;
    lastActivity: string | null;
  };
}

export const useDualMetrics = (prefeitoProfile?: string, prefeituraProfile?: string) => {
  const [metrics, setMetrics] = useState<DualClientMetrics>({
    prefeito: {
      totalComments: 0,
      positiveComments: 0,
      negativeComments: 0,
      neutralComments: 0,
      lastActivity: null
    },
    prefeitura: {
      totalComments: 0,
      positiveComments: 0,
      negativeComments: 0,
      neutralComments: 0,
      lastActivity: null
    }
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar dados do prefeito
      let prefeitoData = null;
      if (prefeitoProfile) {
        const { data, error } = await supabase
          .from('resumo_sentimento_por_profile')
          .select('*')
          .eq('profile', prefeitoProfile)
          .maybeSingle();
        
        if (error) {
          console.error('Erro ao buscar métricas do prefeito:', error);
        } else {
          prefeitoData = data;
        }
      }

      // Buscar dados da prefeitura
      let prefeituraData = null;
      if (prefeituraProfile) {
        const { data, error } = await supabase
          .from('resumo_sentimento_por_profile')
          .select('*')
          .eq('profile', prefeituraProfile)
          .maybeSingle();
        
        if (error) {
          console.error('Erro ao buscar métricas da prefeitura:', error);
        } else {
          prefeituraData = data;
        }
      }

      // Atualizar métricas
      setMetrics({
        prefeito: prefeitoData ? {
          totalComments: Number(prefeitoData.total_comentarios) || 0,
          positiveComments: Number(prefeitoData.positivos) || 0,
          negativeComments: Number(prefeitoData.negativos) || 0,
          neutralComments: Number(prefeitoData.neutros) || 0,
          lastActivity: prefeitoData.ultima_atividade || null
        } : {
          totalComments: 0,
          positiveComments: 0,
          negativeComments: 0,
          neutralComments: 0,
          lastActivity: null
        },
        prefeitura: prefeituraData ? {
          totalComments: Number(prefeituraData.total_comentarios) || 0,
          positiveComments: Number(prefeituraData.positivos) || 0,
          negativeComments: Number(prefeituraData.negativos) || 0,
          neutralComments: Number(prefeituraData.neutros) || 0,
          lastActivity: prefeituraData.ultima_atividade || null
        } : {
          totalComments: 0,
          positiveComments: 0,
          negativeComments: 0,
          neutralComments: 0,
          lastActivity: null
        }
      });
    } catch (error) {
      console.error('Erro inesperado ao buscar métricas duplas:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao carregar métricas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [prefeitoProfile, prefeituraProfile, toast]);

  // Real-time listener
  useEffect(() => {
    if (!prefeitoProfile && !prefeituraProfile) return;

    let channel: any = null;

    const setupRealtimeListener = async () => {
      try {
        channel = supabase
          .channel('dual-metrics-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'analysis-comments'
            },
            (payload) => {
              // Re-buscar métricas quando houver mudanças nos perfis monitorados
              const profileChanged = payload.new && typeof payload.new === 'object' && 'profile' in payload.new 
                ? (payload.new as any).profile 
                : null;
              
              if (profileChanged && (profileChanged === prefeitoProfile || profileChanged === prefeituraProfile)) {
                console.log('📡 Comentário atualizado para perfil monitorado:', profileChanged);
                fetchMetrics();
                
                if (payload.eventType === 'INSERT') {
                  toast({
                    title: "Novo comentário analisado!",
                    description: `Novas métricas disponíveis`,
                  });
                }
              }
            }
          );

        await channel.subscribe();
        console.log('Listener de métricas duplas configurado');
      } catch (error) {
        console.warn('Erro ao configurar listener de métricas duplas:', error);
      }
    };

    setupRealtimeListener();

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.warn('Erro ao remover canal de métricas duplas:', error);
        }
      }
    };
  }, [prefeitoProfile, prefeituraProfile, toast, fetchMetrics]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading };
};