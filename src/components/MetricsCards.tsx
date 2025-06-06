
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, MessageSquare, AlertTriangle } from 'lucide-react';

export const MetricsCards = () => {
  const metrics = [
    {
      title: 'Campanhas Criadas',
      value: '12',
      color: 'text-dashboard-teal'
    },
    {
      title: 'Publicações Feitas',
      value: '47',
      color: 'text-dashboard-teal'
    },
    {
      title: 'Vídeos Produzidos',
      value: '5',
      color: 'text-dashboard-purple'
    }
  ];

  return (
    <div className="text-right mb-8">
      <div className="inline-block">
        <Card className="bg-dashboard-card border-border/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
              Métricas da Equipe da Marketing
            </h3>
            <div className="space-y-4">
              {metrics.map((metric, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{metric.title}</span>
                  <span className={`text-2xl font-bold ${metric.color}`}>{metric.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
