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
import { useParams } from 'react-router-dom';
import { useClients } from '@/hooks/useClients';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EngagementChartProps {
  profile?: string;
}

export const EngagementChart: React.FC<EngagementChartProps> = ({ profile }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('semanal');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedInitialMonth, setSelectedInitialMonth] = useState('0'); // Janeiro = 0

  const { clientId } = useParams<{ clientId: string }>();
  const { clients } = useClients();
  
  const selectedClient = clients.find(client => client.id === clientId);
  const prefeitoProfile = selectedClient?.instagram_prefeito;
  const prefeituraProfile = selectedClient?.instagram_prefeitura;

  // Hooks para buscar dados do prefeito
  const { data: dailyDataPrefeito, isLoading: loadingDailyPrefeito } = useHistoricoSentimentoDiario(prefeitoProfile);
  const { data: weeklyDataPrefeito, isLoading: loadingWeeklyPrefeito } = useHistoricoSentimentoSemanal(prefeitoProfile);
  const { data: monthlyDataPrefeito, isLoading: loadingMonthlyPrefeito } = useHistoricoSentimentoMensal(prefeitoProfile, selectedYear);

  // Hooks para buscar dados da prefeitura
  const { data: dailyDataPrefeitura, isLoading: loadingDailyPrefeitura } = useHistoricoSentimentoDiario(prefeituraProfile);
  const { data: weeklyDataPrefeitura, isLoading: loadingWeeklyPrefeitura } = useHistoricoSentimentoSemanal(prefeituraProfile);
  const { data: monthlyDataPrefeitura, isLoading: loadingMonthlyPrefeitura } = useHistoricoSentimentoMensal(prefeituraProfile, selectedYear);

  // Para compatibilidade com dados agregados (quando não há cliente específico)
  const { data: dailyDataGeneral, isLoading: loadingDailyGeneral } = useHistoricoSentimentoDiario(profile);
  const { data: weeklyDataGeneral, isLoading: loadingWeeklyGeneral } = useHistoricoSentimentoSemanal(profile);
  const { data: monthlyDataGeneral, isLoading: loadingMonthlyGeneral } = useHistoricoSentimentoMensal(profile, selectedYear);

  // Função para processar dados de um perfil
  const processData = (data: any[], type: 'daily' | 'weekly' | 'monthly') => {
    if (!data?.length) return [];
    
    if (type === 'daily') {
      return data.slice(-7).map(item => ({
        period: item.data_brasileira ? format(new Date(item.data_analise!), 'dd/MM', { locale: ptBR }) : 'N/A',
        sentiment: calculateSentimentScore(
          item.comentarios_positivos || 0,
          item.comentarios_neutros || 0,
          item.comentarios_negativos || 0
        ),
        totalComments: item.total_comentarios || 0,
        positivos: item.comentarios_positivos || 0,
        neutros: item.comentarios_neutros || 0,
        negativos: item.comentarios_negativos || 0
      }));
    }
    
    if (type === 'weekly') {
      return data.slice(-4).map((item, index) => ({
        period: `S${index + 1}`,
        sentiment: calculateSentimentScore(
          item.comentarios_positivos || 0,
          item.comentarios_neutros || 0,
          item.comentarios_negativos || 0
        ),
        totalComments: item.total_comentarios || 0,
        positivos: item.comentarios_positivos || 0,
        neutros: item.comentarios_neutros || 0,
        negativos: item.comentarios_negativos || 0
      }));
    }
    
    if (type === 'monthly') {
      const initialMonthIndex = parseInt(selectedInitialMonth);
      return data
        .filter(item => {
          if (!item.mes_ano) return false;
          const itemMonth = new Date(item.mes_ano).getMonth();
          return itemMonth >= initialMonthIndex;
        })
        .slice(0, 6)
        .map(item => ({
          period: item.mes_nome || format(new Date(item.mes_ano!), 'MMM', { locale: ptBR }),
          sentiment: calculateSentimentScore(
            item.comentarios_positivos || 0,
            item.comentarios_neutros || 0,
            item.comentarios_negativos || 0
          ),
          totalComments: item.total_comentarios || 0,
          positivos: item.comentarios_positivos || 0,
          neutros: item.comentarios_neutros || 0,
          negativos: item.comentarios_negativos || 0
        }));
    }
    
    return [];
  };

  // Processar dados do prefeito
  const processedDailyDataPrefeito = useMemo(() => 
    processData(dailyDataPrefeito, 'daily'), [dailyDataPrefeito]);
  const processedWeeklyDataPrefeito = useMemo(() => 
    processData(weeklyDataPrefeito, 'weekly'), [weeklyDataPrefeito]);
  const processedMonthlyDataPrefeito = useMemo(() => 
    processData(monthlyDataPrefeito, 'monthly'), [monthlyDataPrefeito, selectedInitialMonth]);

  // Processar dados da prefeitura
  const processedDailyDataPrefeitura = useMemo(() => 
    processData(dailyDataPrefeitura, 'daily'), [dailyDataPrefeitura]);
  const processedWeeklyDataPrefeitura = useMemo(() => 
    processData(weeklyDataPrefeitura, 'weekly'), [weeklyDataPrefeitura]);
  const processedMonthlyDataPrefeitura = useMemo(() => 
    processData(monthlyDataPrefeitura, 'monthly'), [monthlyDataPrefeitura, selectedInitialMonth]);

  // Processar dados gerais (para compatibilidade)
  const processedDailyDataGeneral = useMemo(() => 
    processData(dailyDataGeneral, 'daily'), [dailyDataGeneral]);
  const processedWeeklyDataGeneral = useMemo(() => 
    processData(weeklyDataGeneral, 'weekly'), [weeklyDataGeneral]);
  const processedMonthlyDataGeneral = useMemo(() => 
    processData(monthlyDataGeneral, 'monthly'), [monthlyDataGeneral, selectedInitialMonth]);

  const getMonthOptions = () => {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return monthNames.map((month, index) => ({ value: index.toString(), label: month }));
  };

  const getCurrentData = (type: 'prefeito' | 'prefeitura' | 'general') => {
    if (type === 'general') {
      switch (selectedPeriod) {
        case 'diario':
          return processedDailyDataGeneral;
        case 'semanal':
          return processedWeeklyDataGeneral;
        case 'mensal':
          return processedMonthlyDataGeneral;
        default:
          return processedWeeklyDataGeneral;
      }
    }
    
    if (type === 'prefeito') {
      switch (selectedPeriod) {
        case 'diario':
          return processedDailyDataPrefeito;
        case 'semanal':
          return processedWeeklyDataPrefeito;
        case 'mensal':
          return processedMonthlyDataPrefeito;
        default:
          return processedWeeklyDataPrefeito;
      }
    }
    
    if (type === 'prefeitura') {
      switch (selectedPeriod) {
        case 'diario':
          return processedDailyDataPrefeitura;
        case 'semanal':
          return processedWeeklyDataPrefeitura;
        case 'mensal':
          return processedMonthlyDataPrefeitura;
        default:
          return processedWeeklyDataPrefeitura;
      }
    }
    
    return [];
  };

  const isLoading = () => {
    if (clientId) {
      switch (selectedPeriod) {
        case 'diario':
          return loadingDailyPrefeito || loadingDailyPrefeitura;
        case 'semanal':
          return loadingWeeklyPrefeito || loadingWeeklyPrefeitura;
        case 'mensal':
          return loadingMonthlyPrefeito || loadingMonthlyPrefeitura;
        default:
          return false;
      }
    } else {
      switch (selectedPeriod) {
        case 'diario':
          return loadingDailyGeneral;
        case 'semanal':
          return loadingWeeklyGeneral;
        case 'mensal':
          return loadingMonthlyGeneral;
        default:
          return false;
      }
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

  // Combinar dados do prefeito e prefeitura para o gráfico
  const getCombinedData = () => {
    if (!clientId) {
      return getCurrentData('general');
    }

    const prefeitoData = getCurrentData('prefeito');
    const prefeituraData = getCurrentData('prefeitura');
    
    // Criar array combinado com ambos os dados
    const maxLength = Math.max(prefeitoData.length, prefeituraData.length);
    const combinedData = [];
    
    for (let i = 0; i < maxLength; i++) {
      const prefeitoItem = prefeitoData[i];
      const prefeituraItem = prefeituraData[i];
      
      combinedData.push({
        period: prefeitoItem?.period || prefeituraItem?.period || `P${i + 1}`,
        prefeito: prefeitoItem?.sentiment || 0,
        prefeitura: prefeituraItem?.sentiment || 0,
        prefeitoComments: prefeitoItem?.totalComments || 0,
        prefeituraComments: prefeituraItem?.totalComments || 0
      });
    }
    
    return combinedData;
  };

  return (
    <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 h-[480px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white">
          📊 Histórico de Sentimento Médio
        </CardTitle>
        <p className="text-sm text-blue-300">
          {clientId ? 'Comparação temporal entre prefeito e prefeitura' : 'Análise temporal do sentimento médio'}
        </p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-40 mb-3">
          {isLoading() ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-blue-300">Carregando dados...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getCombinedData()}>
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
                  formatter={(value: number, name: string) => {
                    if (name === 'prefeito') return [`${value.toFixed(1)}/10`, '👤 Prefeito'];
                    if (name === 'prefeitura') return [`${value.toFixed(1)}/10`, '🏛️ Prefeitura'];
                    return [`${value.toFixed(1)}/10`, 'Score de Sentimento'];
                  }}
                  labelFormatter={(label: string) => `Período: ${label}`}
                />
                {clientId ? (
                  <>
                    <Bar 
                      dataKey="prefeito" 
                      fill="#60a5fa"
                      name="prefeito"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="prefeitura" 
                      fill="#34d399"
                      name="prefeitura"
                      radius={[4, 4, 0, 0]}
                    />
                  </>
                ) : (
                  <Bar 
                    dataKey="prefeito" 
                    fill="#60a5fa"
                    radius={[4, 4, 0, 0]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legenda para cliente específico */}
        {clientId && (
          <div className="flex justify-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#60a5fa' }} />
              <span className="text-xs text-blue-300">👤 Prefeito</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#34d399' }} />
              <span className="text-xs text-blue-300">🏛️ Prefeitura</span>
            </div>
          </div>
        )}

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
