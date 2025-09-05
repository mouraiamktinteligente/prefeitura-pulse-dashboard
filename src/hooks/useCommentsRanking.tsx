import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertaComentario } from './useAlertasComentarios';

export interface RankingComment {
  id: string;
  user: string;
  platform: string;
  comment: string;
  engagement: number;
  type: 'positive' | 'negative';
  link?: string;
}

export const useCommentsRanking = (profile?: string) => {
  return useQuery({
    queryKey: ['comments-ranking', profile],
    queryFn: async () => {
      let query = supabase
        .from('alertas_comentarios')
        .select('*');
      
      if (profile) {
        query = query.eq('profile', profile);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Erro ao buscar ranking de comentários:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
};

export const formatRankingComments = (alertas: AlertaComentario[]) => {
  const topComments: RankingComment[] = [];
  const flopComments: RankingComment[] = [];

  alertas.forEach((alerta) => {
    // Processar comentários positivos _2, _3 e _4 (Top Comments)
    if (alerta.positive_comment_2 && alerta.positive_username_2) {
      topComments.push({
        id: `pos-2-${alerta.id}`,
        user: alerta.positive_username_2,
        platform: 'Instagram', // Assumindo Instagram como padrão
        comment: alerta.positive_comment_2,
        engagement: parseInt(alerta.score_positive_2 || '0'),
        type: 'positive',
        link: alerta.link_comentario_positivo_2
      });
    }
    
    if (alerta.positive_comment_3 && alerta.positive_username_3) {
      topComments.push({
        id: `pos-3-${alerta.id}`,
        user: alerta.positive_username_3,
        platform: 'Instagram',
        comment: alerta.positive_comment_3,
        engagement: parseInt(alerta.score_positive_3 || '0'),
        type: 'positive',
        link: alerta.link_comentario_positivo_3
      });
    }
    
    if (alerta.positive_comment_4 && alerta.positive_username_4) {
      topComments.push({
        id: `pos-4-${alerta.id}`,
        user: alerta.positive_username_4,
        platform: 'Instagram',
        comment: alerta.positive_comment_4,
        engagement: parseInt(alerta.score_positive_4 || '0'),
        type: 'positive',
        link: alerta.link_comentario_positivo_4
      });
    }

    // Processar comentários negativos _2, _3 e _4 (Flop Comments)
    if (alerta.negative_comment_2 && alerta.negative_username_2) {
      flopComments.push({
        id: `neg-2-${alerta.id}`,
        user: alerta.negative_username_2,
        platform: 'Instagram',
        comment: alerta.negative_comment_2,
        engagement: parseInt(alerta.score_negative_2 || '0'),
        type: 'negative',
        link: alerta.link_comentario_negativo_2
      });
    }
    
    if (alerta.negative_comment_3 && alerta.negative_username_3) {
      flopComments.push({
        id: `neg-3-${alerta.id}`,
        user: alerta.negative_username_3,
        platform: 'Instagram',
        comment: alerta.negative_comment_3,
        engagement: parseInt(alerta.score_negative_3 || '0'),
        type: 'negative',
        link: alerta.link_comentario_negativo_3
      });
    }
    
    if (alerta.negative_comment_4 && alerta.negative_username_4) {
      flopComments.push({
        id: `neg-4-${alerta.id}`,
        user: alerta.negative_username_4,
        platform: 'Instagram',
        comment: alerta.negative_comment_4,
        engagement: parseInt(alerta.score_negative_4 || '0'),
        type: 'negative',
        link: alerta.link_comentario_negativo_4
      });
    }
  });

  // Ordenar por prioridade (_2 primeiro, depois _3, depois _4)
  const sortedTopComments = topComments
    .sort((a, b) => {
      const getPriority = (id: string) => {
        if (id.includes('pos-2-')) return 1;
        if (id.includes('pos-3-')) return 2;
        if (id.includes('pos-4-')) return 3;
        return 999;
      };
      return getPriority(a.id) - getPriority(b.id);
    })
    .slice(0, 3);
  
  const sortedFlopComments = flopComments
    .sort((a, b) => a.engagement - b.engagement)
    .slice(0, 3);

  return {
    topComments: sortedTopComments,
    flopComments: sortedFlopComments
  };
};