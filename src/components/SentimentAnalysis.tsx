import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useParams } from 'react-router-dom';
import { useClients } from '@/hooks/useClients';
import { useClientMetrics } from '@/hooks/useClientMetrics';
import { useAggregatedMetrics } from '@/hooks/useAggregatedMetrics';

interface SentimentAnalysisProps {
  clientId?: string;
  compact?: boolean;
}

export const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ 
  clientId: propClientId, 
  compact = false 
}) => {
  const { clientId: paramClientId } = useParams<{ clientId: string }>();
  const { clients } = useClients();
  
  const effectiveClientId = propClientId || paramClientId;
  const selectedClient = clients.find(client => client.id === effectiveClientId);
  
  const { metrics: clientMetrics, loading: clientLoading } = useClientMetrics(selectedClient?.instagram || undefined);
  const { metrics: aggregatedMetrics, loading: aggregatedLoading } = useAggregatedMetrics();
  
  const metrics = effectiveClientId ? clientMetrics : aggregatedMetrics;
  const loading = effectiveClientId ? clientLoading : aggregatedLoading;

  // Memoriza os dados do gráfico para evitar recálculos desnecessários
  const data = useMemo(() => {
    const { totalComments, positiveComments, negativeComments, neutralComments } = metrics;
    
    if (totalComments === 0) {
      return [
        { name: 'Positivo', value: 0, color: '#3B82F6', label: '0%' },
        { name: 'Neutro', value: 0, color: '#10B981', label: '0%' },
        { name: 'Negativo', value: 0, color: '#EF4444', label: '0%' }
      ];
    }

    const positivePercentage = Math.round((positiveComments / totalComments) * 100);
    const neutralPercentage = Math.round((neutralComments / totalComments) * 100);
    const negativePercentage = Math.round((negativeComments / totalComments) * 100);

    return [
      { name: 'Positivo', value: positivePercentage, color: '#3B82F6', label: `${positivePercentage}%` },
      { name: 'Neutro', value: neutralPercentage, color: '#10B981', label: `${neutralPercentage}%` },
      { name: 'Negativo', value: negativePercentage, color: '#EF4444', label: `${negativePercentage}%` }
    ]; // Mantém todas as fatias para garantir legenda completa
  }, [metrics]);

  // Renderiza percentuais dentro das fatias com fonte visível
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
    if (value === 0 || value < 5) return null; // Não mostra label em fatias muito pequenas
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={compact ? "12" : "16"}
        fontWeight="600"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
      >
        {`${value}%`}
      </text>
    );
  };

  if (loading) {
    if (compact) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Análise de Sentimento
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  // Versão compacta para ClientCard
  if (compact) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="w-24 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={48}
                dataKey="value"
                startAngle={90}
                endAngle={450}
                labelLine={false}
                label={renderLabel}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="none"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legenda completa para versão compacta */}
        <div className="flex gap-2 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
            <span className="text-muted-foreground">Positivo: {data.find(d => d.name === 'Positivo')?.value || 0}%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
            <span className="text-muted-foreground">Neutro: {data.find(d => d.name === 'Neutro')?.value || 0}%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} />
            <span className="text-muted-foreground">Negativo: {data.find(d => d.name === 'Negativo')?.value || 0}%</span>
          </div>
        </div>
      </div>
    );
  }

  // Versão completa para Dashboard
  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Análise de Sentimento
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribuição dos sentimentos nos comentários
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={100}
                dataKey="value"
                startAngle={90}
                endAngle={450}
                labelLine={false}
                label={renderLabel}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="none"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legenda completa sempre visível */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
            <span className="text-sm font-medium">Positivo: {data.find(d => d.name === 'Positivo')?.value || 0}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }} />
            <span className="text-sm font-medium">Neutro: {data.find(d => d.name === 'Neutro')?.value || 0}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }} />
            <span className="text-sm font-medium">Negativo: {data.find(d => d.name === 'Negativo')?.value || 0}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};