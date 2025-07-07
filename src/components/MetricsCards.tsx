
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, MessageSquare, AlertTriangle } from 'lucide-react';

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
    if (totalComments === 0) return 0;
    
    // Converte os valores para percentuais (0 a 1)
    const positivePercentage = positiveComments / totalComments;
    const neutralPercentage = neutralComments / totalComments;
    const negativePercentage = negativeComments / totalComments;
    
    // Aplica a fórmula corrigida: (positivo * 10) + (neutro * 5) + (negativo * 0)
    // Escala de 0 a 10: 100% positivos = 10, 100% neutros = 5, 100% negativos = 0
    const sentimentScore = (positivePercentage * 10) + (neutralPercentage * 5) + (negativePercentage * 0);
    
    // Arredonda para 1 casa decimal
    return Math.round(sentimentScore * 10) / 10;
  };

  const averageSentiment = calculateAverageSentiment();
  
  // Simulação de valor anterior para calcular variação (em um cenário real, isso viria de dados históricos)
  const previousSentiment = averageSentiment > 0 ? averageSentiment - 0.3 : 0;
  const sentimentChange = averageSentiment - previousSentiment;
  const isPositiveChange = sentimentChange >= 0;

  const metrics = [
    {
      title: 'Comentários Analisados',
      value: totalComments.toLocaleString(),
      period: 'total acumulado',
      trend: 'up',
      change: '+12%',
      icon: MessageSquare,
      color: 'text-blue-400'
    },
    {
      title: 'Sentimento Médio',
      value: averageSentiment.toFixed(1),
      period: 'de 10',
      trend: isPositiveChange ? 'up' : 'down',
      change: isPositiveChange ? `+${sentimentChange.toFixed(1)}` : sentimentChange.toFixed(1),
      icon: isPositiveChange ? TrendingUp : TrendingDown,
      color: averageSentiment >= 5 ? 'text-green-400' : 'text-red-400'
    },
    {
      title: 'Postagens Hoje',
      value: '24',
      period: 'publicações',
      trend: 'down',
      change: '-2',
      icon: TrendingDown,
      color: 'text-orange-400'
    },
    {
      title: 'Risco Reputacional',
      value: negativeComments.toString(),
      period: 'comentários negativos',
      trend: 'down',
      change: '-3',
      icon: AlertTriangle,
      color: 'text-red-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 hover:bg-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300 mb-1">{metric.title}</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                  <span className="text-sm text-blue-300">{metric.period}</span>
                </div>
                <div className={`flex items-center space-x-1 mt-2 ${
                  metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span className="text-xs font-medium">{metric.change}</span>
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
