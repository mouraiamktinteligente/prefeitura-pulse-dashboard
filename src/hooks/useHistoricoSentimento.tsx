import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hook para buscar dados diários
export const useHistoricoSentimentoDiario = (profile?: string) => {
  return useQuery({
    queryKey: ['historico-sentimento-diario', profile],
    queryFn: async () => {
      let query = supabase
        .from('resumo_diario_comments')
        .select('*')
        .order('data_analise', { ascending: true });

      if (profile) {
        query = query.eq('profile', profile);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar dados diários:', error);
        throw error;
      }

      return data || [];
    },
    enabled: true,
  });
};

// Hook para buscar dados semanais
export const useHistoricoSentimentoSemanal = (profile?: string) => {
  return useQuery({
    queryKey: ['historico-sentimento-semanal', profile],
    queryFn: async () => {
      let query = supabase
        .from('resumo_semanal_comments')
        .select('*')
        .order('semana_inicio', { ascending: true });

      if (profile) {
        query = query.eq('profile', profile);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar dados semanais:', error);
        throw error;
      }

      return data || [];
    },
    enabled: true,
  });
};

// Hook para buscar dados mensais
export const useHistoricoSentimentoMensal = (profile?: string, year?: string) => {
  return useQuery({
    queryKey: ['historico-sentimento-mensal', profile, year],
    queryFn: async () => {
      let query = supabase
        .from('resumo_mensal_comments')
        .select('*')
        .order('mes_ano', { ascending: true });

      if (profile) {
        query = query.eq('profile', profile);
      }

      if (year) {
        // Filtrar por ano específico
        query = query.gte('mes_ano', `${year}-01-01`).lt('mes_ano', `${parseInt(year) + 1}-01-01`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar dados mensais:', error);
        throw error;
      }

      return data || [];
    },
    enabled: true,
  });
};

// Função utilitária para calcular sentimento médio
export const calculateSentimentScore = (
  positivos: number = 0, 
  neutros: number = 0, 
  negativos: number = 0
): number => {
  const total = positivos + neutros + negativos;
  
  if (total === 0) return 0;
  
  // Converte os valores para percentuais (0 a 1)
  const positivePercentage = positivos / total;
  const neutralPercentage = neutros / total;
  const negativePercentage = negativos / total;
  
  // Aplica a fórmula: (positivo * 10) + (neutro * 5) + (negativo * 0)
  const sentimentScore = (positivePercentage * 10) + (neutralPercentage * 5) + (negativePercentage * 0);
  
  // Arredonda para 1 casa decimal
  return Math.round(sentimentScore * 10) / 10;
};