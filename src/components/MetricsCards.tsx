import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, MessageSquare, AlertTriangle, Smile, Meh, Frown, Calendar } from 'lucide-react';

interface MetricsCardsProps {
  totalComments?: number;
  positiveComments?: number;
  negativeComments?: number;
  neutralComments?: number;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  totalComments = 0,
  positiveComments = 0,
  negativeComments = 0,
  neutralComments = 0
}) => {
  // Calcula o sentimento médio usando a fórmula corrigida
  const calculateAverageSentiment = () => {
    console.log('MetricsCards - Calculando sentimento médio:', {
      totalComments,
      positiveComments,
      negativeComments,
      neutralComments
    });

    if (totalComments === 0) return 0;
    
    // Converte os valores para percentuais (0 a 1)
    const positivePercentage = positiveComments / totalComments;
    const neutralPercentage = neutralComments / totalComments;
    const negativePercentage = negativeComments / totalComments;
    
    console.log('MetricsCards - Percentuais:', {
      positivePercentage,
      neutralPercentage,
      negativePercentage
    });
    
    // Aplica a fórmula corrigida: (positivo * 10) + (neutro * 5) + (negativo * 0)
    // Escala de 0 a 10: 100% positivos = 10, 100% neutros = 5, 100% negativos = 0
    const sentimentScore = (positivePercentage * 10) + (neutralPercentage * 5) + (negativePercentage * 0);
    
    console.log('MetricsCards - Score calculado:', sentimentScore);
    
    // Arredonda para 1 casa decimal
    const finalScore = Math.round(sentimentScore * 10) / 10;
    
    console.log('MetricsCards - Score final:', finalScore);
    
    return finalScore;
  };

  const averageSentiment = calculateAverageSentiment();
  
  // Função para determinar o ícone baseado no sentimento
  const getSentimentIcon = (score: number) => {
    if (score >= 8) return Smile; // Muito feliz (8-10)
    if (score >= 5) return Meh; // Levemente feliz/neutro (5-7)
    if (score >= 2) return Frown; // Um pouco triste (2-4)
    return Frown; // Muito triste (0-1)
  };

  // Função para determinar a cor do ícone baseado no sentimento
  const getSentimentColor = (score: number) => {
    if (score >= 8) return 'text-green-400'; // Verde para muito feliz
    if (score >= 5) return 'text-yellow-400'; // Amarelo para neutro/levemente feliz
    if (score >= 2) return 'text-orange-400'; // Laranja para um pouco triste
    return 'text-red-400'; // Vermelho para muito triste
  };

  // Force re-render when metrics change
  React.useEffect(() => {
    console.log('MetricsCards - Props atualizadas:', {
      totalComments,
      positiveComments,
      negativeComments,
      neutralComments,
      averageSentiment
    });
  }, [totalComments, positiveComments, negativeComments, neutralComments, averageSentiment]);

  const metrics = [
    {
      title: 'Comentários Analisados',
      value: totalComments.toLocaleString(),
      period: 'total acumulado',
      icon: MessageSquare,
      color: 'text-blue-400'
    },
    {
      title: 'Sentimento Médio',
      value: averageSentiment.toFixed(1),
      period: 'de 10',
      icon: getSentimentIcon(averageSentiment),
      color: getSentimentColor(averageSentiment)
    },
    {
      title: 'Postagens Hoje',
      value: '24',
      period: 'publicações',
      icon: Calendar,
      color: 'text-orange-400'
    },
    {
      title: 'Risco Reputacional',
      value: negativeComments.toString(),
      period: 'comentários negativos',
      icon: AlertTriangle,
      color: 'text-red-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={`${index}-${Date.now()}`} className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 hover:bg-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300 mb-1">{metric.title}</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                  <span className="text-sm text-blue-300">{metric.period}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-blue-600 ${metric.color}`}>
                <metric.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
