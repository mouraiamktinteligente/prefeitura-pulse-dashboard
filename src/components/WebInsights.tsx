import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Globe, Radio, MessageCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useResumoWhatsapp } from '@/hooks/useResumoWhatsapp';

interface Insight {
  id: string;
  tipo: 'web' | 'radio' | 'whatsapp';
  titulo: string;
  resumo: string;
  criticidade: 'critico' | 'atencao' | 'positivo' | 'info';
  fonte?: string;
  link?: string;
  tempoRelativo: string;
}

// Dados mockados para demonstração
const mockInsights: Insight[] = [
  // Web Insights
  {
    id: 'w1',
    tipo: 'web',
    titulo: 'Protesto contra aumento do transporte público',
    resumo: 'Manifestantes bloqueiam avenida principal em protesto contra o aumento da tarifa de ônibus. Situação está causando congestionamento na região central.',
    criticidade: 'critico',
    fonte: 'Portal G1',
    link: 'https://g1.globo.com',
    tempoRelativo: 'Há 2 horas'
  },
  {
    id: 'w2',
    tipo: 'web',
    titulo: 'Denúncia de superfaturamento em obras públicas',
    resumo: 'Vereadores questionam valores de contratos para reforma de escola municipal. TCE foi acionado para investigar possíveis irregularidades.',
    criticidade: 'critico',
    fonte: 'Folha Regional',
    link: 'https://folha.com',
    tempoRelativo: 'Há 4 horas'
  },
  {
    id: 'w3',
    tipo: 'web',
    titulo: 'Atraso na conclusão de UBS gera reclamações',
    resumo: 'Obra da nova Unidade Básica de Saúde está 3 meses atrasada. Moradores reclamam da falta de atendimento médico na região.',
    criticidade: 'atencao',
    fonte: 'Diário do Povo',
    tempoRelativo: 'Há 5 horas'
  },
  {
    id: 'w4',
    tipo: 'web',
    titulo: 'Reclamações sobre atendimento em hospital municipal',
    resumo: 'Pacientes relatam demora no atendimento e falta de medicamentos. Secretaria de Saúde prometeu melhorias.',
    criticidade: 'atencao',
    fonte: 'Portal de Notícias',
    tempoRelativo: 'Há 8 horas'
  },
  {
    id: 'w5',
    tipo: 'web',
    titulo: 'Discussão sobre aumento de impostos municipais',
    resumo: 'Câmara analisa projeto que pode aumentar IPTU em até 15%. População está dividida sobre a medida.',
    criticidade: 'atencao',
    fonte: 'Jornal da Cidade',
    tempoRelativo: 'Há 12 horas'
  },
  {
    id: 'w6',
    tipo: 'web',
    titulo: 'Inauguração de nova escola municipal',
    resumo: 'Prefeito inaugurou escola com capacidade para 500 alunos. Comunidade comemora investimento na educação.',
    criticidade: 'positivo',
    fonte: 'TV Local',
    tempoRelativo: 'Há 1 dia'
  },
  {
    id: 'w7',
    tipo: 'web',
    titulo: 'Programa social beneficia 2 mil famílias',
    resumo: 'Nova iniciativa da prefeitura distribui cestas básicas e oferece cursos profissionalizantes. Moradores elogiam ação.',
    criticidade: 'positivo',
    fonte: 'Rádio Comunitária',
    tempoRelativo: 'Há 1 dia'
  },
  {
    id: 'w8',
    tipo: 'web',
    titulo: 'Prefeito anuncia agenda para próxima semana',
    resumo: 'Divulgada programação oficial com visitas a bairros e reuniões com secretários.',
    criticidade: 'info',
    fonte: 'Site da Prefeitura',
    tempoRelativo: 'Há 2 dias'
  },
  // Radio Insights
  {
    id: 'r1',
    tipo: 'radio',
    titulo: 'Debate acalorado sobre situação da saúde pública',
    resumo: 'Programa matinal debateu problemas nos postos de saúde. Ouvintes ligaram relatando dificuldades para conseguir atendimento.',
    criticidade: 'critico',
    fonte: 'Rádio Cidade FM',
    tempoRelativo: 'Há 3 horas'
  },
  {
    id: 'r2',
    tipo: 'radio',
    titulo: 'Prefeito mencionado em entrevista sobre segurança',
    resumo: 'Comandante da PM comentou sobre parceria com prefeitura para melhorar policiamento nos bairros.',
    criticidade: 'atencao',
    fonte: 'Rádio Notícias AM',
    tempoRelativo: 'Há 6 horas'
  },
  {
    id: 'r3',
    tipo: 'radio',
    titulo: 'Questionamento sobre prazo de obras na BR',
    resumo: 'Ouvintes questionaram atrasos na duplicação da rodovia. Prefeito não estava presente para responder.',
    criticidade: 'atencao',
    fonte: 'Rádio Popular',
    tempoRelativo: 'Há 10 horas'
  },
  {
    id: 'r4',
    tipo: 'radio',
    titulo: 'Citação positiva sobre programa de emprego',
    resumo: 'Entrevistado elogiou iniciativa da prefeitura que já gerou 300 vagas de trabalho no município.',
    criticidade: 'info',
    fonte: 'Rádio Cultura',
    tempoRelativo: 'Há 1 dia'
  },
  {
    id: 'r5',
    tipo: 'radio',
    titulo: 'Participação em programa de rádio local',
    resumo: 'Secretário de Obras explicou cronograma de melhorias na infraestrutura urbana.',
    criticidade: 'info',
    fonte: 'Rádio Comunitária',
    tempoRelativo: 'Há 2 dias'
  }
];

const CriticalityBadge = ({ criticidade }: { criticidade: Insight['criticidade'] }) => {
  const config = {
    critico: { label: 'CRÍTICO', icon: AlertCircle, color: 'bg-red-500/20 text-red-400 border-red-500' },
    atencao: { label: 'ATENÇÃO', icon: AlertCircle, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500' },
    positivo: { label: 'POSITIVO', icon: AlertCircle, color: 'bg-green-500/20 text-green-400 border-green-500' },
    info: { label: 'INFORMATIVO', icon: AlertCircle, color: 'bg-blue-500/20 text-blue-400 border-blue-500' }
  };

  const { label, icon: Icon, color } = config[criticidade];

  return (
    <Badge className={`${color} border text-xs font-semibold px-2 py-1`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
};

const InsightCard = ({ insight }: { insight: Insight }) => {
  const borderColor = {
    critico: 'border-l-red-500',
    atencao: 'border-l-yellow-500',
    positivo: 'border-l-green-500',
    info: 'border-l-blue-500'
  }[insight.criticidade];

  const bgColor = {
    critico: 'bg-red-500/5 hover:bg-red-500/10',
    atencao: 'bg-yellow-500/5 hover:bg-yellow-500/10',
    positivo: 'bg-green-500/5 hover:bg-green-500/10',
    info: 'bg-blue-500/5 hover:bg-blue-500/10'
  }[insight.criticidade];

  return (
    <div className={`${bgColor} ${borderColor} border-l-4 rounded-lg p-3 mb-3 transition-all duration-200 hover:shadow-md animate-fade-in`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-white font-medium text-sm flex-1">{insight.titulo}</h4>
        <CriticalityBadge criticidade={insight.criticidade} />
      </div>
      
      <p className="text-blue-200 text-xs mb-3 leading-relaxed">{insight.resumo}</p>
      
      <div className="flex items-center justify-between text-xs text-blue-300">
        <div className="flex items-center gap-2">
          <span className="font-medium">{insight.fonte}</span>
          {insight.link && (
            <a 
              href={insight.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <span className="text-blue-400">{insight.tempoRelativo}</span>
      </div>
    </div>
  );
};

const InsightSection = ({ 
  titulo, 
  icon: Icon, 
  insights, 
  corIcone,
  corBadge 
}: { 
  titulo: string; 
  icon: any; 
  insights: Insight[];
  corIcone: string;
  corBadge: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const criticos = insights.filter(i => i.criticidade === 'critico').length;

  return (
    <div className="mb-6">
      <div 
        className="flex items-center justify-between mb-3 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${corIcone}`} />
          <h3 className="text-white font-semibold text-base">{titulo}</h3>
          <Badge className={`${corBadge} text-xs`}>
            {insights.length}
          </Badge>
          {criticos > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border border-red-500 text-xs">
              {criticos} crítico{criticos > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-blue-300 group-hover:text-white transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-blue-300 group-hover:text-white transition-colors" />
        )}
      </div>

      {isExpanded && (
        <div className="space-y-2 animate-fade-in">
          {insights.map(insight => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
};

export const WebInsights = () => {
  const webInsights = mockInsights.filter(i => i.tipo === 'web');
  const radioInsights = mockInsights.filter(i => i.tipo === 'radio');
  const { whatsappPorCidade, isLoading: isLoadingWhatsapp } = useResumoWhatsapp();
  
  const totalCriticos = mockInsights.filter(i => i.criticidade === 'critico').length;

  return (
    <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 min-h-[600px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              🔍 Alertas Web
            </CardTitle>
            <p className="text-red-400 text-xs mt-1">⚠️ Em construção</p>
          </div>
          {totalCriticos > 0 && (
            <Badge className="bg-red-500 text-white text-xs animate-pulse">
              {totalCriticos} ALERTA{totalCriticos > 1 ? 'S' : ''}
            </Badge>
          )}
        </div>
        <p className="text-blue-300 text-xs mt-1">Resumo das análises multiplataforma</p>
      </CardHeader>

      <CardContent className="max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-700/20 px-4">
        {/* Web Section */}
        <InsightSection 
          titulo="Alertas Web"
          icon={Globe}
          insights={webInsights}
          corIcone="text-cyan-400"
          corBadge="bg-cyan-500/20 text-cyan-300 border border-cyan-500"
        />

        {/* Radio Section */}
        <InsightSection 
          titulo="Insights Rádio"
          icon={Radio}
          insights={radioInsights}
          corIcone="text-orange-400"
          corBadge="bg-orange-500/20 text-orange-300 border border-orange-500"
        />

        {/* WhatsApp Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-semibold text-base">Insights WhatsApp</h3>
            <Badge className="bg-green-500/20 text-green-300 border border-green-500 text-xs">
              {whatsappPorCidade.reduce((total, cidade) => total + cidade.grupos.length, 0)} grupos
            </Badge>
          </div>

          {isLoadingWhatsapp ? (
            <div className="bg-green-500/5 border-l-4 border-l-green-500 rounded-lg p-4 text-center">
              <p className="text-green-300 text-sm">Carregando dados...</p>
            </div>
          ) : whatsappPorCidade.length === 0 ? (
            <div className="bg-green-500/5 border-l-4 border-l-green-500 rounded-lg p-4 text-center">
              <p className="text-green-300 text-sm">Nenhum dado disponível</p>
            </div>
          ) : (
            <div className="space-y-4">
              {whatsappPorCidade.map((cidadeData) => (
                <div key={cidadeData.cidade} className="bg-green-500/5 border-l-4 border-l-green-500 rounded-lg p-4">
                  {/* Cabeçalho da Cidade */}
                  <div className="mb-3 pb-2 border-b border-green-500/30">
                    <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                      📍 {cidadeData.cidade}
                      <Badge className="bg-green-600/30 text-green-300 text-xs">
                        {cidadeData.grupos.length} grupo{cidadeData.grupos.length > 1 ? 's' : ''}
                      </Badge>
                    </h4>
                  </div>

                  {/* Grupos da Cidade */}
                  <div className="space-y-3">
                    {cidadeData.grupos.map((grupo) => (
                      <div 
                        key={grupo.id} 
                        className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all duration-200"
                      >
                        {/* Nome do Grupo */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h5 className="text-green-300 font-medium text-sm flex items-center gap-1">
                            💬 {grupo.grupo}
                          </h5>
                        </div>

                        {/* Cidade (linha abaixo do grupo) */}
                        <p className="text-blue-200 text-xs mb-2">
                          📌 {grupo.cidade}
                        </p>

                        {/* Resumo */}
                        <div className="mb-2">
                          <p className="text-blue-200 text-xs leading-relaxed">
                            {grupo.resumo}
                          </p>
                        </div>

                        {/* Tema (opcional) */}
                        {grupo.tema && (
                          <div className="mb-2">
                            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/50 text-xs">
                              🏷️ {grupo.tema}
                            </Badge>
                          </div>
                        )}

                        {/* Data */}
                        <div className="flex items-center justify-end mt-2 pt-2 border-t border-green-500/20">
                          <span className="text-green-400 text-xs">
                            📅 {grupo.data_formatada}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
