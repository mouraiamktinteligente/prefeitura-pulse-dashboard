import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  useHistoricoSentimentoDiario, 
  useHistoricoSentimentoSemanal, 
  useHistoricoSentimentoMensal,
  calculateSentimentScore 
} from '@/hooks/useHistoricoSentimento';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EngagementChartProps {
  profile?: string;
}

export const EngagementChart: React.FC<EngagementChartProps> = ({ profile }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('semanal');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedInitialMonth, setSelectedInitialMonth] = useState('0'); // Janeiro = 0

  // Hooks para buscar dados reais
  const { data: dailyData, isLoading: loadingDaily } = useHistoricoSentimentoDiario(profile);
  const { data: weeklyData, isLoading: loadingWeekly } = useHistoricoSentimentoSemanal(profile);
  const { data: monthlyData, isLoading: loadingMonthly } = useHistoricoSentimentoMensal(profile, selectedYear);

  // Processar dados diários
  const processedDailyData = useMemo(() => {
    if (!dailyData?.length) return [];
    
    return dailyData.slice(-7).map(item => ({
      period: item.data_brasileira ? format(new Date(item.data_analise!), 'dd/MM', { locale: ptBR }) : 'N/A',
      sentiment: item.score_sentimento || calculateSentimentScore(
        item.comentarios_positivos || 0,
        item.comentarios_neutros || 0,
        item.comentarios_negativos || 0
      ),
      totalComments: item.total_comentarios || 0,
      positivos: item.comentarios_positivos || 0,
      neutros: item.comentarios_neutros || 0,
      negativos: item.comentarios_negativos || 0
    }));
  }, [dailyData]);

  // Processar dados semanais
  const processedWeeklyData = useMemo(() => {
    if (!weeklyData?.length) return [];
    
    return weeklyData.slice(-4).map((item, index) => ({
      period: `S${index + 1}`,
      sentiment: item.score_sentimento || calculateSentimentScore(
        item.comentarios_positivos || 0,
        item.comentarios_neutros || 0,
        item.comentarios_negativos || 0
      ),
      totalComments: item.total_comentarios || 0,
      positivos: item.comentarios_positivos || 0,
      neutros: item.comentarios_neutros || 0,
      negativos: item.comentarios_negativos || 0
    }));
  }, [weeklyData]);

  // Processar dados mensais
  const processedMonthlyData = useMemo(() => {
    if (!monthlyData?.length) return [];
    
    const initialMonthIndex = parseInt(selectedInitialMonth);
    const months = monthlyData
      .filter(item => {
        if (!item.mes_ano) return false;
        const itemMonth = new Date(item.mes_ano).getMonth();
        return itemMonth >= initialMonthIndex;
      })
      .slice(0, 6)
      .map(item => ({
        period: item.mes_nome || format(new Date(item.mes_ano!), 'MMM', { locale: ptBR }),
        sentiment: item.score_sentimento || calculateSentimentScore(
          item.comentarios_positivos || 0,
          item.comentarios_neutros || 0,
          item.comentarios_negativos || 0
        ),
        totalComments: item.total_comentarios || 0,
        positivos: item.comentarios_positivos || 0,
        neutros: item.comentarios_neutros || 0,
        negativos: item.comentarios_negativos || 0
      }));
    
    return months;
  }, [monthlyData, selectedInitialMonth]);

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
        return processedDailyData;
      case 'semanal':
        return processedWeeklyData;
      case 'mensal':
        return processedMonthlyData;
      default:
        return processedWeeklyData;
    }
  };

  const isLoading = () => {
    switch (selectedPeriod) {
      case 'diario':
        return loadingDaily;
      case 'semanal':
        return loadingWeekly;
      case 'mensal':
        return loadingMonthly;
      default:
        return false;
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
    <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 h-[480px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white">
          📊 Histórico de Sentimento Médio
        </CardTitle>
        <p className="text-sm text-blue-300">Análise temporal do sentimento médio</p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-40 mb-3">
          {isLoading() ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-blue-300">Carregando dados...</div>
            </div>
          ) : (
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
                formatter={(value: number, name: string, props: any) => {
                  const data = props.payload;
                  return [
                    `${value.toFixed(1)}/10`,
                    'Score de Sentimento'
                  ];
                }}
                labelFormatter={(label: string, payload: any[]) => {
                  if (payload?.length > 0) {
                    const data = payload[0].payload;
                    return `${label} - ${data.totalComments || 0} comentários`;
                  }
                  return label;
                }}
              />
              <Bar 
                dataKey="sentiment" 
                fill="#60a5fa"
                radius={[4, 4, 0, 0]}
              />
              </BarChart>
            </ResponsiveContainer>
          )}
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
