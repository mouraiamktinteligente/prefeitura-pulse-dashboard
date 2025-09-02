import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AlertaComentario {
  id: string;
  negative_comment?: string;
  negative_username?: string;
  score_negative?: string;
  positive_comment?: string;
  positive_username?: string;
  score_positive?: string;
  created_at: string;
  profile?: string;
}

export const useAlertasComentarios = (profile?: string) => {
  return useQuery({
    queryKey: ['alertas-comentarios', profile],
    queryFn: async () => {
      console.log('🔍 Buscando alertas de comentários para profile:', profile);
      
      let query = supabase
        .from('alertas_comentarios')
        .select('*')
        .order('created_at', { ascending: false });

      // Filtrar por profile se fornecido
      if (profile) {
        query = query.eq('profile', profile);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar alertas de comentários:', error);
        throw error;
      }

      console.log('✅ Alertas encontrados:', data?.length || 0);
      return data as AlertaComentario[];
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
};

export const getSeverityFromScore = (scoreNegative?: string, scorePositive?: string) => {
  const negScore = scoreNegative ? parseFloat(scoreNegative) : 0;
  const posScore = scorePositive ? parseFloat(scorePositive) : 0;
  const maxScore = Math.max(negScore, posScore);

  if (maxScore > 70) return 'alta';
  if (maxScore >= 30) return 'média';
  return 'baixa';
};

export const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'agora';
  if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h atrás`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d atrás`;
};