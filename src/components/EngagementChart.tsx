import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const EngagementChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('semanal');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedInitialMonth, setSelectedInitialMonth] = useState('0'); // Janeiro = 0

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

  const allMonthlyData = [
    { period: 'Jan', sentiment: 6.8 },
    { period: 'Fev', sentiment: 7.2 },
    { period: 'Mar', sentiment: 7.9 },
    { period: 'Abr', sentiment: 8.1 },
    { period: 'Mai', sentiment: 7.6 },
    { period: 'Jun', sentiment: 8.3 },
    { period: 'Jul', sentiment: 7.9 },
    { period: 'Ago', sentiment: 8.2 },
    { period: 'Set', sentiment: 7.4 },
    { period: 'Out', sentiment: 8.0 },
    { period: 'Nov', sentiment: 7.7 },
    { period: 'Dez', sentiment: 8.5 }
  ];

  const getMonthlyData = () => {
    const initialMonthIndex = parseInt(selectedInitialMonth);
    const months = [];
    
    for (let i = 0; i < 6; i++) {
      const monthIndex = (initialMonthIndex + i) % 12;
      if (allMonthlyData[monthIndex]) {
        months.push(allMonthlyData[monthIndex]);
      }
    }
    
    return months;
  };

  const getMonthOptions = () => {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return monthNames.map((month, index) => ({ value: index.toString(), label: month }));
  };

  const getCurrentData = () => {
    switch (selectedPeriod) {
      case 'diario':
        return dailyData;
      case 'semanal':
        return weeklyData;
      case 'mensal':
        return getMonthlyData();
      default:
        return weeklyData;
    }
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i.toString());
    }
    return years;
  };

  const currentData = getCurrentData().map(item => ({
    ...item,
    fill: item.sentiment >= 7 ? '#22c55e' : item.sentiment >= 5 ? '#f59e0b' : '#ef4444'
  }));

  return (
    <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 h-[400px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white">
          📊 Histórico de Sentimento Médio
        </CardTitle>
        <p className="text-sm text-blue-300">Análise temporal do sentimento médio</p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-40 mb-3">
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
        <div className="bg-blue-600 border border-blue-500 rounded-lg p-3">
          <h4 className="font-semibold text-white mb-2">⏱️ Período de Análise</h4>
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

          {/* Controles adicionais para período mensal */}
          {selectedPeriod === 'mensal' && (
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-blue-300 mb-1 block">Ano</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="bg-blue-500 border-blue-400 text-white h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getYearOptions().map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-blue-300 mb-1 block">Mês Inicial</label>
                  <Select value={selectedInitialMonth} onValueChange={setSelectedInitialMonth}>
                    <SelectTrigger className="bg-blue-500 border-blue-400 text-white h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getMonthOptions().map(month => (
                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
