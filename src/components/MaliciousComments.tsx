
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink, Instagram, Info, AlertTriangle } from 'lucide-react';
import { useAlertasComentarios, formatTimeAgo, AlertaComentario } from '@/hooks/useAlertasComentarios';

interface MaliciousCommentsProps {
  profile?: string;
}

interface CommentData {
  id: string;
  user: string;
  comment: string;
  score: string | null;
  link: string | null;
  timestamp: string;
  type: 'negative' | 'positive';
}

type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

const getSeverityLevel = (score: string | null, type: 'negative' | 'positive'): SeverityLevel => {
  if (!score || type !== 'negative') return 'low';
  
  const numScore = parseInt(score);
  if (numScore >= 0 && numScore <= 15) return 'critical';
  if (numScore >= 16 && numScore <= 35) return 'high';
  if (numScore >= 36 && numScore <= 49) return 'medium';
  return 'low';
};

const getSeverityConfig = (severity: SeverityLevel) => {
  const configs = {
    critical: {
      badge: 'CRÍTICO',
      icon: '🚨',
      className: 'alert-critical',
      badgeClassName: 'alert-badge-critical',
      priority: 1
    },
    high: {
      badge: 'ALTO RISCO',
      icon: '⚠️',
      className: 'alert-high',
      badgeClassName: 'alert-badge-high',
      priority: 2
    },
    medium: {
      badge: 'ATENÇÃO',
      icon: '⚡',
      className: 'alert-medium',
      badgeClassName: 'alert-badge-medium',
      priority: 3
    },
    low: {
      badge: '',
      icon: '',
      className: '',
      badgeClassName: '',
      priority: 4
    }
  };
  return configs[severity];
};

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
    
    // Processar apenas os comentários _1 (mais recente)
    const i = 1;
    
    // Comentário negativo _1
    const negativeComment = alerta[`negative_comment_${i}` as keyof AlertaComentario] as string;
    const negativeUsername = alerta[`negative_username_${i}` as keyof AlertaComentario] as string;
    const negativeScore = alerta[`score_negative_${i}` as keyof AlertaComentario] as string;
    const negativeLink = alerta[`link_comentario_negativo_${i}` as keyof AlertaComentario] as string;
    
    if (negativeComment && negativeUsername) {
      items.push({
        id: `${alerta.id}-neg-${i}`,
        user: negativeUsername,
        comment: negativeComment,
        score: negativeScore,
        link: negativeLink,
        timestamp: formatTimeAgo(alerta.created_at),
        type: 'negative' as const
      });
    }

    // Comentário positivo _1
    const positiveComment = alerta[`positive_comment_${i}` as keyof AlertaComentario] as string;
    const positiveUsername = alerta[`positive_username_${i}` as keyof AlertaComentario] as string;
    const positiveScore = alerta[`score_positive_${i}` as keyof AlertaComentario] as string;
    const positiveLink = alerta[`link_comentario_positivo_${i}` as keyof AlertaComentario] as string;
    
    if (positiveComment && positiveUsername) {
      items.push({
        id: `${alerta.id}-pos-${i}`,
        user: positiveUsername,
        comment: positiveComment,
        score: positiveScore,
        link: positiveLink,
        timestamp: formatTimeAgo(alerta.created_at),
        type: 'positive' as const
      });
    }

    return items;
  };

  const allComments = alertas ? alertas.flatMap(formatCommentData) : [];
  
  // Selecionar apenas o comentário mais crítico (negativo) e o melhor (positivo)
  const negativeComments = allComments.filter(comment => comment.type === 'negative');
  const positiveComments = allComments.filter(comment => comment.type === 'positive');
  
  // Encontrar o comentário negativo mais crítico (menor score)
  const mostCriticalNegative = negativeComments.length > 0 
    ? negativeComments.reduce((prev, current) => {
        const prevScore = parseInt(prev.score || '100');
        const currentScore = parseInt(current.score || '100');
        return currentScore < prevScore ? current : prev;
      })
    : null;

  // Encontrar o comentário positivo melhor (maior score)
  const bestPositive = positiveComments.length > 0
    ? positiveComments.reduce((prev, current) => {
        const prevScore = parseInt(prev.score || '0');
        const currentScore = parseInt(current.score || '0');
        return currentScore > prevScore ? current : prev;
      })
    : null;

  // Criar array com apenas os 2 comentários mais relevantes
  const relevantComments = [mostCriticalNegative, bestPositive].filter(Boolean) as CommentData[];

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
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-blue-300 cursor-help hover:text-white transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <div className="text-sm space-y-2">
                  <div className="font-semibold">Diretrizes de referência:</div>
                  <div className="space-y-1 text-xs">
                    <div>• 0–15: insultos, ódio, desejo de dano</div>
                    <div>• 16–35: reclamações fortes, frustração</div>
                    <div>• 36–49: levemente negativo, cético</div>
                    <div>• 50: neutro, pergunta objetiva</div>
                    <div>• 51–64: levemente positivo, educado</div>
                    <div>• 65–84: positivo claro, elogio</div>
                    <div>• 85–100: eufórico, gratidão intensa</div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-blue-300 cursor-help hover:text-white transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <div className="text-sm space-y-2">
                  <div className="font-semibold">Diretrizes de referência:</div>
                  <div className="space-y-1 text-xs">
                    <div>• 0–15: insultos, ódio, desejo de dano</div>
                    <div>• 16–35: reclamações fortes, frustração</div>
                    <div>• 36–49: levemente negativo, cético</div>
                    <div>• 50: neutro, pergunta objetiva</div>
                    <div>• 51–64: levemente positivo, educado</div>
                    <div>• 65–84: positivo claro, elogio</div>
                    <div>• 85–100: eufórico, gratidão intensa</div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <p className="text-sm text-blue-300">
            {isLoading ? 'Carregando alertas...' : 
             relevantComments.length === 0 ? 'Nenhum alerta encontrado' : 
             'Comentários mais relevantes detectados'}
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
        ) : relevantComments.length > 0 ? (
          <div className="space-y-4 max-h-[320px] overflow-y-auto">
            {relevantComments.map((comment) => {
              const severity = getSeverityLevel(comment.score, comment.type);
              const config = getSeverityConfig(severity);
              
              return (
              <div 
                key={comment.id} 
                className={`border border-blue-600 bg-blue-600 rounded-lg p-3 space-y-3 ${config.className}`}
              >
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
                  <div className="flex items-center space-x-2">
                    {config.badge && (
                      <Badge className={`text-xs px-2 py-0.5 ${config.badgeClassName}`}>
                        {config.icon} {config.badge}
                      </Badge>
                    )}
                    {comment.link && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 w-7 p-0 border-blue-500 text-blue-300 hover:bg-blue-500"
                        onClick={() => window.open(comment.link, '_blank', 'noopener,noreferrer')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
            })}
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
