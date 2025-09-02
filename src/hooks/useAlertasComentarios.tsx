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
  link_comentario_negativo?: string;
  link_comentario_positivo?: string;
  created_at: string;
  profile?: string;
}

export const useAlertasComentarios = (profile?: string) => {
  console.log('🚀 Hook useAlertasComentarios inicializado com profile:', profile);
  
  return useQuery({
    queryKey: ['alertas-comentarios', profile],
    queryFn: async () => {
      console.log('🔍 Executando query para alertas de comentários...');
      console.log('📋 Profile usado na busca:', profile);
      
      try {
        // Primeiro, testar uma query simples sem filtros
        console.log('🧪 Testando query sem filtros...');
        const testQuery = await supabase
          .from('alertas_comentarios')
          .select('*', { count: 'exact', head: true });
        
        console.log('📊 Total de registros na tabela:', testQuery.count || 0);
        
        // Agora executar a query principal
        let query = supabase
          .from('alertas_comentarios')
          .select('*')
          .order('created_at', { ascending: false });

        // Filtrar por profile se fornecido
        if (profile) {
          console.log('🎯 Aplicando filtro por profile:', profile);
          query = query.eq('profile', profile);
        } else {
          console.log('⚠️ Nenhum profile fornecido, buscando todos os registros');
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ Erro na query:', error);
          console.error('❌ Detalhes do erro:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }

        console.log('✅ Query executada com sucesso!');
        console.log('📦 Dados retornados:', data?.length || 0, 'registros');
        console.log('🔍 Primeiros registros:', data?.slice(0, 2));
        
        return data as AlertaComentario[];
      } catch (error) {
        console.error('💥 Erro inesperado na query:', error);
        throw error;
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
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