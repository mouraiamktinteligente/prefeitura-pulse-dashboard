
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, ExternalLink, Instagram } from 'lucide-react';
import { useAlertasComentarios, formatTimeAgo, AlertaComentario } from '@/hooks/useAlertasComentarios';

interface MaliciousCommentsProps {
  profile?: string;
}

export const MaliciousComments = ({ profile }: MaliciousCommentsProps) => {
  console.log('🎯 MaliciousComments renderizado com profile:', profile);
  
  const { data: alertas, isLoading, error } = useAlertasComentarios(profile);
  
  console.log('📊 Estado do hook:', { 
    alertas: alertas?.length || 0, 
    isLoading, 
    error: error?.message 
  });

  const formatCommentData = (alerta: AlertaComentario) => {
    const items = [];
    
    // Adicionar comentário negativo se existir
    if (alerta.negative_comment && alerta.negative_username) {
      items.push({
        id: `${alerta.id}-neg`,
        user: alerta.negative_username,
        comment: alerta.negative_comment,
        score: alerta.score_negative,
        link: alerta.link_comentario_negativo,
        timestamp: formatTimeAgo(alerta.created_at),
        type: 'negative'
      });
    }

    // Adicionar comentário positivo se existir
    if (alerta.positive_comment && alerta.positive_username) {
      items.push({
        id: `${alerta.id}-pos`,
        user: alerta.positive_username,
        comment: alerta.positive_comment,
        score: alerta.score_positive,
        link: alerta.link_comentario_positivo,
        timestamp: formatTimeAgo(alerta.created_at),
        type: 'positive'
      });
    }

    return items;
  };

  const allComments = alertas ? alertas.flatMap(formatCommentData) : [];

  const getSentimentIcon = (type: string, score: string | null) => {
    const icon = type === 'positive' ? '👍' : '👎';
    const scoreText = score ? ` ${score}` : '';
    return `${icon}${scoreText}`;
  };

  if (error) {
    return (
      <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 h-[480px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            ⚠️ Alertas de comentários sensíveis
          </CardTitle>
          <p className="text-sm text-red-300">Erro ao carregar alertas</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 h-[480px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          ⚠️ Alertas de comentários sensíveis
        </CardTitle>
        <p className="text-sm text-blue-300">
          {isLoading ? 'Carregando alertas...' : 
           allComments.length === 0 ? 'Nenhum alerta encontrado' : ''}
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border border-blue-600 bg-blue-600 rounded-lg p-3 animate-pulse">
                <div className="h-4 bg-blue-500 rounded mb-2"></div>
                <div className="h-3 bg-blue-500 rounded mb-2"></div>
                <div className="h-3 bg-blue-500 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : allComments.length > 0 ? (
          <div className="space-y-4 max-h-[320px] overflow-y-auto">
            {allComments.map((comment) => (
              <div key={comment.id} className="border border-blue-600 bg-blue-600 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Instagram className="h-4 w-4 text-blue-300" />
                    <span className="font-medium text-white">@{comment.user}</span>
                  </div>
                  <div className="text-lg">
                    {getSentimentIcon(comment.type, comment.score)}
                  </div>
                </div>
                
                <p className="text-sm text-blue-300 italic">"{comment.comment}"</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-300">{comment.timestamp}</span>
                  <div className="flex space-x-2">
                    {comment.link && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 px-2 border-blue-500 text-blue-300 hover:bg-blue-500"
                        onClick={() => window.open(comment.link, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ver comentário
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-7 px-2 border-blue-500 text-blue-300 hover:bg-blue-500">
                      <Users className="h-3 w-3 mr-1" />
                      Equipe
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[280px] text-blue-300">
            <div className="text-center">
              <p className="text-sm">Nenhum alerta de comentário encontrado</p>
              <p className="text-xs mt-1 opacity-75">Os alertas aparecerão quando detectados</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
