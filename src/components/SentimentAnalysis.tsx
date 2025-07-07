
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useParams } from 'react-router-dom';
import { useClients } from '@/hooks/useClients';
import { useClientMetrics } from '@/hooks/useClientMetrics';
import { useAggregatedMetrics } from '@/hooks/useAggregatedMetrics';

interface SentimentAnalysisProps {
  clientId?: string;
  compact?: boolean; // Nova prop para versão compacta
}

export const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ 
  clientId: propClientId, 
  compact = false 
}) => {
  const { clientId: paramClientId } = useParams<{ clientId: string }>();
  const { clients } = useClients();
  
  // Usa o clientId da prop se fornecido, senão usa o da URL
  const effectiveClientId = propClientId || paramClientId;
  const selectedClient = clients.find(client => client.id === effectiveClientId);
  
  // Se há um clientId, usa métricas específicas do cliente, senão usa métricas agregadas
  const { metrics: clientMetrics, loading: clientLoading } = useClientMetrics(selectedClient?.instagram || undefined);
  const { metrics: aggregatedMetrics, loading: aggregatedLoading } = useAggregatedMetrics();
  
  const metrics = effectiveClientId ? clientMetrics : aggregatedMetrics;
  const loading = effectiveClientId ? clientLoading : aggregatedLoading;

  // Força re-renderização quando os dados mudam
  React.useEffect(() => {
    console.log('SentimentAnalysis - Metrics atualizadas:', metrics);
  }, [metrics]);

  // Calcula os percentuais baseados nos dados reais - MESMA LÓGICA PARA AMBOS
  const calculatePercentages = () => {
    const { totalComments, positiveComments, negativeComments, neutralComments } = metrics;
    
    console.log('SentimentAnalysis - Calculando percentuais:', {
      totalComments,
      positiveComments,
      negativeComments,
      neutralComments
    });
    
    if (totalComments === 0) {
      return [
        { name: 'Positivo', value: 0, color: '#10b981' },
        { name: 'Neutro', value: 0, color: '#f59e0b' },
        { name: 'Negativo', value: 0, color: '#ef4444' }
      ];
    }

    const positivePercentage = Math.round((positiveComments / totalComments) * 100);
    const neutralPercentage = Math.round((neutralComments / totalComments) * 100);
    const negativePercentage = Math.round((negativeComments / totalComments) * 100);

    const result = [
      { name: 'Positivo', value: positivePercentage, color: '#10b981' },
      { name: 'Neutro', value: neutralPercentage, color: '#f59e0b' },
      { name: 'Negativo', value: negativePercentage, color: '#ef4444' }
    ];

    console.log('SentimentAnalysis - Percentuais calculados:', result);
    return result;
  };

  const data = calculatePercentages();

  // Função customizada para renderizar os labels - APENAS PARA VERSÃO COMPLETA
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
    if (value === 0) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize="14"
        fontWeight="bold"
      >
        {`${value}%`}
      </text>
    );
  };

  if (loading) {
    if (compact) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="animate-pulse text-blue-300 text-xs">Carregando...</div>
        </div>
      );
    }
    
    return (
      <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 h-[480px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            📊 Análise de Sentimento
          </CardTitle>
          <p className="text-sm text-blue-300">Última análise realizada.</p>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-blue-300">Carregando dados...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Versão compacta para uso no ClientCard
  if (compact) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 min-h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart key={`pie-${effectiveClientId}-${Date.now()}`}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={40}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center space-x-4 mt-2">
          {data.map((item) => (
            <div key={item.name} className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-1`} style={{ backgroundColor: item.color }} />
              <p className="text-xs text-blue-300">{item.name}</p>
              <p className="text-sm font-semibold text-white">{item.value}%</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Versão completa para dashboards
  return (
    <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 h-[480px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          📊 Análise de Sentimento
        </CardTitle>
        <p className="text-sm text-blue-300">Última análise realizada.</p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart key={`pie-full-${effectiveClientId}-${Date.now()}`}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {data.map((item) => (
            <div key={item.name} className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-1`} style={{ backgroundColor: item.color }} />
              <p className="text-xs text-blue-300">{item.name}</p>
              <p className="text-sm font-semibold text-white">{item.value}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
