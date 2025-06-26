
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useParams } from 'react-router-dom';
import { useClients } from '@/hooks/useClients';
import { useClientMetrics } from '@/hooks/useClientMetrics';

export const SentimentAnalysis = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { clients } = useClients();
  const selectedClient = clients.find(client => client.id === clientId);
  const { metrics, loading } = useClientMetrics(selectedClient?.instagram || undefined);

  // Calcula os percentuais baseados nos dados reais
  const calculatePercentages = () => {
    const { totalComments, positiveComments, negativeComments, neutralComments } = metrics;
    
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

    return [
      { name: 'Positivo', value: positivePercentage, color: '#10b981' },
      { name: 'Neutro', value: neutralPercentage, color: '#f59e0b' },
      { name: 'Negativo', value: negativePercentage, color: '#ef4444' }
    ];
  };

  const data = calculatePercentages();

  if (loading) {
    return (
      <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 h-[480px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            📊 Análise de Sentimento
          </CardTitle>
          <p className="text-sm text-blue-300">Instagram + Web (últimas 24h)</p>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-blue-300">Carregando dados...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 h-[480px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          📊 Análise de Sentimento
        </CardTitle>
        <p className="text-sm text-blue-300">Instagram + Web (últimas 24h)</p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
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
