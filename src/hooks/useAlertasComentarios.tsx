import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export interface AlertaComentario {
  id: string;
  profile?: string;
  created_at: string;
  // Comentários negativos _1 (para MaliciousComments)
  negative_comment_1?: string;
  negative_username_1?: string;
  score_negative_1?: string;
  link_comentario_negativo_1?: string;
  // Comentários positivos _1 (para MaliciousComments)
  positive_comment_1?: string;
  positive_username_1?: string;
  score_positive_1?: string;
  link_comentario_positivo_1?: string;
  // Comentários negativos _2, _3 e _4 (para CommentsRanking)
  negative_comment_2?: string;
  negative_username_2?: string;
  score_negative_2?: string;
  link_comentario_negativo_2?: string;
  negative_comment_3?: string;
  negative_username_3?: string;
  score_negative_3?: string;
  link_comentario_negativo_3?: string;
  negative_comment_4?: string;
  negative_username_4?: string;
  score_negative_4?: string;
  link_comentario_negativo_4?: string;
  // Comentários positivos _2, _3 e _4 (para CommentsRanking)
  positive_comment_2?: string;
  positive_username_2?: string;
  score_positive_2?: string;
  link_comentario_positivo_2?: string;
  positive_comment_3?: string;
  positive_username_3?: string;
  score_positive_3?: string;
  link_comentario_positivo_3?: string;
  positive_comment_4?: string;
  positive_username_4?: string;
  score_positive_4?: string;
  link_comentario_positivo_4?: string;
}

export const useAlertasComentarios = (profile?: string) => {
  const { user } = useAuth();
  console.log('🚀 Hook useAlertasComentarios inicializado com profile:', profile);
  
  return useQuery({
    queryKey: ['alertas-comentarios', profile, user?.email],
    queryFn: async () => {
      if (!user?.email) {
        console.error('❌ Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }

      console.log('🔍 Executando RPC para alertas de comentários...');
      console.log('📋 Profile usado na busca:', profile);
      console.log('👤 Email do usuário:', user.email);
      
      try {
        const { data, error } = await supabase.rpc('get_alertas_comentarios', {
          p_profile: profile || null,
          p_session_email: user.email,
          p_limit: 1
        });

        if (error) {
          console.error('❌ Erro na RPC:', error);
          throw error;
        }

        console.log('✅ RPC executada com sucesso!');
        console.log('📦 Dados retornados:', data?.length || 0, 'registros');
        
        return data as AlertaComentario[];
      } catch (error) {
        console.error('💥 Erro inesperado na RPC:', error);
        throw error;
      }
    },
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    retry: 2
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