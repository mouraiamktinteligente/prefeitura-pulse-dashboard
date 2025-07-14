import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const EngagementChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('semanal');

  // Dados de exemplo para diferentes períodos
  const dailyData = [
    { period: 'Seg', sentiment: 7.2 },
    { period: 'Ter', sentiment: 6.8 },
    { period: 'Qua', sentiment: 8.1 },
    { period: 'Qui', sentiment: 7.5 },
    { period: 'Sex', sentiment: 8.9 },
    { period: 'Sáb', sentiment: 6.3 },
    { period: 'Dom', sentiment: 5.8 }
  ];

  const weeklyData = [
    { period: 'S1', sentiment: 7.1 },
    { period: 'S2', sentiment: 6.9 },
    { period: 'S3', sentiment: 8.2 },
    { period: 'S4', sentiment: 7.8 }
  ];

  const monthlyData = [
    { period: 'Jan', sentiment: 6.8 },
    { period: 'Fev', sentiment: 7.2 },
    { period: 'Mar', sentiment: 7.9 },
    { period: 'Abr', sentiment: 8.1 },
    { period: 'Mai', sentiment: 7.6 },
    { period: 'Jun', sentiment: 8.3 }
  ];

  const getCurrentData = () => {
    switch (selectedPeriod) {
      case 'diario':
        return dailyData;
      case 'semanal':
        return weeklyData;
      case 'mensal':
        return monthlyData;
      default:
        return weeklyData;
    }
  };

  const currentData = getCurrentData().map(item => ({
    ...item,
    fill: item.sentiment >= 7 ? '#22c55e' : item.sentiment >= 5 ? '#f59e0b' : '#ef4444'
  }));

  return (
    <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 h-[480px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          📊 Histórico de Sentimento Médio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="period" stroke="#93c5fd" fontSize={12} />
              <YAxis 
                stroke="#93c5fd" 
                fontSize={12} 
                domain={[0, 10]}
                tickCount={6}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }}
                formatter={(value: number) => [`${value.toFixed(1)}/10`, 'Score de Sentimento']}
              />
              <Bar 
                dataKey="sentiment" 
                fill="#60a5fa"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Seletor de Período */}
        <div className="bg-blue-600 border border-blue-500 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">⏱️ Período de Análise</h4>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="bg-blue-500 border-blue-400 text-white">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diario">Diário</SelectItem>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-blue-300 mt-2">
            {selectedPeriod === 'diario' && 'Últimos 7 dias'}
            {selectedPeriod === 'semanal' && 'Últimas 4 semanas'}
            {selectedPeriod === 'mensal' && 'Últimos 6 meses'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
