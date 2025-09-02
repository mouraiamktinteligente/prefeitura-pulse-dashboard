import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useParams } from 'react-router-dom';
import { useClients } from '@/hooks/useClients';
import { useDualMetrics } from '@/hooks/useDualMetrics';
import { useAggregatedMetrics } from '@/hooks/useAggregatedMetrics';
import { Download } from 'lucide-react';

interface SentimentAnalysisProps {
  clientId?: string;
  compact?: boolean;
  onGerarAnalise?: () => void;
}

export const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ 
  clientId: propClientId, 
  compact = false,
  onGerarAnalise
}) => {
  const { clientId: paramClientId } = useParams<{ clientId: string }>();
  const { clients } = useClients();
  
  const effectiveClientId = propClientId || paramClientId;
  const selectedClient = clients.find(client => client.id === effectiveClientId);
  
  // Para cliente específico, usar métricas duplas
  const { metrics: dualMetrics, loading: dualLoading } = useDualMetrics(
    selectedClient?.instagram_prefeito,
    selectedClient?.instagram_prefeitura
  );
  
  // Para dados agregados, manter o hook existente
  const { metrics: aggregatedMetrics, loading: aggregatedLoading } = useAggregatedMetrics();
  
  const loading = effectiveClientId ? dualLoading : aggregatedLoading;

  // Função para processar dados de um perfil específico
  const processProfileData = (metrics: any) => {
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
    ];
  };

  // Dados do prefeito e prefeitura
  const prefeitoData = useMemo(() => {
    if (!effectiveClientId) return processProfileData(aggregatedMetrics);
    return processProfileData(dualMetrics.prefeito);
  }, [effectiveClientId, dualMetrics.prefeito, aggregatedMetrics]);

  const prefeituraData = useMemo(() => {
    if (!effectiveClientId) return processProfileData(aggregatedMetrics);
    return processProfileData(dualMetrics.prefeitura);
  }, [effectiveClientId, dualMetrics.prefeitura, aggregatedMetrics]);

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
      <Card className="h-[480px]">
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

  // Componente para renderizar um gráfico individual
  const PieChartComponent = ({ data, title, totalComments }: { data: any[], title: string, totalComments: number }) => (
    <div className="flex-1">
      <h3 className="text-sm font-medium text-muted-foreground mb-2 text-center">{title}</h3>
      <div className="h-32 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={45}
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
      <div className="text-xs text-center text-muted-foreground mt-1">
        {totalComments} comentários
      </div>
    </div>
  );

  // Versão compacta para ClientCard
  if (compact) {
    const prefeitoMetrics = effectiveClientId ? dualMetrics.prefeito : aggregatedMetrics;
    const prefeituraMetrics = effectiveClientId ? dualMetrics.prefeitura : aggregatedMetrics;

    return (
      <div className="h-full flex flex-col space-y-3">
        {effectiveClientId ? (
          <div className="grid grid-cols-2 gap-3 flex-1">
            <PieChartComponent 
              data={prefeitoData} 
              title="Prefeito" 
              totalComments={prefeitoMetrics.totalComments}
            />
            <PieChartComponent 
              data={prefeituraData} 
              title="Prefeitura" 
              totalComments={prefeituraMetrics.totalComments}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prefeitoData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={40}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                    labelLine={false}
                    label={renderLabel}
                  >
                    {prefeitoData.map((entry, index) => (
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
          </div>
        )}
        
        {/* Legenda compacta com mais espaço */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
              <span className="text-white">Positivo</span>
            </div>
            <span className="text-white font-semibold">
              {(effectiveClientId ? prefeitoData : prefeitoData).find(d => d.name === 'Positivo')?.value || 0}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
              <span className="text-white">Neutro</span>
            </div>
            <span className="text-white font-semibold">
              {(effectiveClientId ? prefeitoData : prefeitoData).find(d => d.name === 'Neutro')?.value || 0}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} />
              <span className="text-white">Negativo</span>
            </div>
            <span className="text-white font-semibold">
              {(effectiveClientId ? prefeitoData : prefeitoData).find(d => d.name === 'Negativo')?.value || 0}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Versão completa para Dashboard
  return (
    <Card className="h-[480px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Análise de Sentimento
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {effectiveClientId ? 'Comparação entre perfis do prefeito e prefeitura' : 'Distribuição dos sentimentos nos comentários'}
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        {effectiveClientId ? (
          <div className="space-y-4">
            {/* Dois gráficos lado a lado */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <h3 className="text-sm font-semibold mb-2">👤 Prefeito</h3>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prefeitoData}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={60}
                        dataKey="value"
                        startAngle={90}
                        endAngle={450}
                        labelLine={false}
                        label={renderLabel}
                      >
                        {prefeitoData.map((entry, index) => (
                          <Cell 
                            key={`cell-prefeito-${index}`} 
                            fill={entry.color}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dualMetrics.prefeito.totalComments} comentários
                </p>
              </div>

              <div className="text-center">
                <h3 className="text-sm font-semibold mb-2">🏛️ Prefeitura</h3>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prefeituraData}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={60}
                        dataKey="value"
                        startAngle={90}
                        endAngle={450}
                        labelLine={false}
                        label={renderLabel}
                      >
                        {prefeituraData.map((entry, index) => (
                          <Cell 
                            key={`cell-prefeitura-${index}`} 
                            fill={entry.color}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dualMetrics.prefeitura.totalComments} comentários
                </p>
              </div>
            </div>

            {/* Legenda compartilhada */}
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
                <span className="text-xs font-medium">Positivo</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
                <span className="text-xs font-medium">Neutro</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                <span className="text-xs font-medium">Negativo</span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prefeitoData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={85}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                    labelLine={false}
                    label={renderLabel}
                  >
                    {prefeitoData.map((entry, index) => (
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
            
            {/* Legenda para dados agregados */}
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
                <span className="text-xs font-medium">Positivo: {prefeitoData.find(d => d.name === 'Positivo')?.value || 0}%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
                <span className="text-xs font-medium">Neutro: {prefeitoData.find(d => d.name === 'Neutro')?.value || 0}%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                <span className="text-xs font-medium">Negativo: {prefeitoData.find(d => d.name === 'Negativo')?.value || 0}%</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Botão Gerar Análise */}
        {onGerarAnalise && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={onGerarAnalise}
              className="bg-green-600 hover:bg-green-700 text-white border-0 font-medium rounded-md px-4 py-2"
            >
              <Download className="w-4 h-4 mr-2" />
              Gerar Análise
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};