import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Radio, MessageCircle, CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useResumoWhatsapp } from '@/hooks/useResumoWhatsapp';
import { useResumoRadio } from '@/hooks/useResumoRadio';
import { useResumoWeb } from '@/hooks/useResumoWeb';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface WebInsightsProps {
  prefeituraFiltro?: string; // instagram_prefeitura para rádio e web
  nomePrefeituraCompleto?: string; // nome completo para whatsapp
}

export const WebInsights = ({ prefeituraFiltro, nomePrefeituraCompleto }: WebInsightsProps) => {
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const { whatsappPorCidade, isLoading: isLoadingWhatsapp } = useResumoWhatsapp(dataSelecionada, nomePrefeituraCompleto);
  const { radioPorCidade, isLoading: isLoadingRadio } = useResumoRadio(dataSelecionada, prefeituraFiltro);
  const { webPorCidade, isLoading: isLoadingWeb } = useResumoWeb(dataSelecionada, prefeituraFiltro);
  
  const [isWhatsappExpanded, setIsWhatsappExpanded] = useState(true);
  const [isRadioExpanded, setIsRadioExpanded] = useState(false);
  const [isWebExpanded, setIsWebExpanded] = useState(false);

  return (
    <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 min-h-[600px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            🔍 Alertas Web
          </CardTitle>
        </div>
        <p className="text-blue-300 text-xs mt-1">Resumo das análises multiplataforma</p>
        
        <div className="mt-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-blue-600/30 border-blue-500/50 hover:bg-blue-600/50 text-white",
                  !dataSelecionada && "text-blue-300"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataSelecionada ? (
                  format(dataSelecionada, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dataSelecionada}
                onSelect={(date) => date && setDataSelecionada(date)}
                initialFocus
                locale={ptBR}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      <CardContent className="max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-700/20 px-4">
        {/* 1. WhatsApp Section - PRIMEIRO */}
        <div className="mb-6">
          <div 
            className="flex items-center justify-between mb-3 cursor-pointer group"
            onClick={() => setIsWhatsappExpanded(!isWhatsappExpanded)}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-semibold text-base">Insights WhatsApp</h3>
              <Badge className="bg-green-500/20 text-green-300 border border-green-500 text-xs">
                {whatsappPorCidade.reduce((total, cidade) => total + cidade.grupos.length, 0)} grupos
              </Badge>
            </div>
            {isWhatsappExpanded ? (
              <ChevronUp className="w-4 h-4 text-blue-300 group-hover:text-white transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-300 group-hover:text-white transition-colors" />
            )}
          </div>

          {isWhatsappExpanded && (
            <>
              {isLoadingWhatsapp ? (
                <div className="bg-green-500/5 border-l-4 border-l-green-500 rounded-lg p-4 text-center">
                  <p className="text-green-300 text-sm">🔄 Carregando dados...</p>
                </div>
              ) : whatsappPorCidade.length === 0 ? (
                <div className="bg-green-500/5 border-l-4 border-l-green-500 rounded-lg p-4 text-center">
                  <p className="text-green-300 text-sm">📅 Nenhum dado encontrado para esta data</p>
                  <p className="text-blue-300 text-xs mt-2">
                    Data selecionada: {dataSelecionada.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    {prefeituraFiltro && ` • Prefeitura: ${prefeituraFiltro}`}
                  </p>
                </div>
              ) : (
            <div className="space-y-4">
              {whatsappPorCidade.map((cidadeData) => (
                <div key={cidadeData.cidade} className="bg-green-500/5 border-l-4 border-l-green-500 rounded-lg p-4">
                  <div className="mb-3 pb-2 border-b border-green-500/30">
                    <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                      📍 {cidadeData.cidade}
                      <Badge className="bg-green-600/30 text-green-300 text-xs">
                        {cidadeData.grupos.length} grupo{cidadeData.grupos.length > 1 ? 's' : ''}
                      </Badge>
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {cidadeData.grupos.map((grupo) => (
                      <div 
                        key={grupo.id} 
                        className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h5 className="text-green-300 font-medium text-sm flex items-center gap-1">
                            💬 {grupo.grupo}
                          </h5>
                        </div>

                        <p className="text-blue-200 text-xs mb-2">
                          📌 {grupo.cidade}
                        </p>

                        <div className="mb-2">
                          <p className="text-blue-200 text-xs leading-relaxed">
                            {grupo.resumo}
                          </p>
                        </div>

                        {grupo.tema && (
                          <div className="mb-2">
                            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/50 text-xs">
                              🏷️ {grupo.tema}
                            </Badge>
                          </div>
                        )}

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
            </>
          )}
        </div>

        {/* 2. Rádio Section - SEGUNDO */}
        <div className="mb-6">
          <div 
            className="flex items-center justify-between mb-3 cursor-pointer group"
            onClick={() => setIsRadioExpanded(!isRadioExpanded)}
          >
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-orange-400" />
              <h3 className="text-white font-semibold text-base">Insights Rádio</h3>
              <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500 text-xs">
                {radioPorCidade.reduce((total, cidade) => total + cidade.alertas.length, 0)} alertas
              </Badge>
            </div>
            {isRadioExpanded ? (
              <ChevronUp className="w-4 h-4 text-blue-300 group-hover:text-white transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-300 group-hover:text-white transition-colors" />
            )}
          </div>
          
          {isRadioExpanded && (
            <>
              {isLoadingRadio ? (
                <div className="bg-orange-500/5 border-l-4 border-l-orange-500 rounded-lg p-4 text-center">
                  <p className="text-orange-300 text-sm">🔄 Carregando dados...</p>
                </div>
    ) : radioPorCidade.length === 0 ? (
      <div className="bg-orange-500/5 border-l-4 border-l-orange-500 rounded-lg p-4 text-center">
        <p className="text-orange-300 text-sm">📅 Nenhum dado encontrado para esta data</p>
        <p className="text-blue-300 text-xs mt-2">
          Data selecionada: {dataSelecionada.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          {prefeituraFiltro && ` • Prefeitura: ${prefeituraFiltro}`}
        </p>
      </div>
              ) : (
                <div className="space-y-4">
                  {radioPorCidade.map((cidadeData) => (
                    <div key={cidadeData.cidade} className="bg-orange-500/5 border-l-4 border-l-orange-500 rounded-lg p-4">
                      <div className="mb-3 pb-2 border-b border-orange-500/30">
                        <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                          📍 {cidadeData.cidade}
                          <Badge className="bg-orange-600/30 text-orange-300 text-xs">
                            {cidadeData.alertas.length} alerta{cidadeData.alertas.length > 1 ? 's' : ''}
                          </Badge>
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {cidadeData.alertas.map((alerta) => (
                          <div key={alerta.id} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all duration-200">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h5 className="text-orange-300 font-medium text-sm flex items-center gap-1">
                                📻 {alerta.radio || 'Rádio não identificada'}
                              </h5>
                              {alerta.sentiment && (
                                <Badge className={`text-xs ${
                                  alerta.sentiment === 'Positivo' ? 'bg-green-500/20 text-green-300 border-green-500' :
                                  alerta.sentiment === 'Negativo' ? 'bg-red-500/20 text-red-300 border-red-500' :
                                  'bg-gray-500/20 text-gray-300 border-gray-500'
                                }`}>
                                  {alerta.sentiment} {alerta.sentiment_score && `(${alerta.sentiment_score})`}
                                </Badge>
                              )}
                            </div>

                            <p className="text-blue-200 text-xs leading-relaxed mb-2">
                              {alerta.resumo}
                            </p>

                            {alerta.tema && (
                              <div className="mb-2">
                                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/50 text-xs">
                                  🏷️ {alerta.tema}
                                </Badge>
                              </div>
                            )}

                            <div className="flex items-center justify-end mt-2 pt-2 border-t border-orange-500/20">
                              <span className="text-orange-400 text-xs">
                                📅 {alerta.data_formatada}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* 3. Web Section - TERCEIRO */}
        <div className="mb-4">
          <div 
            className="flex items-center justify-between mb-3 cursor-pointer group"
            onClick={() => setIsWebExpanded(!isWebExpanded)}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold text-base">Alertas Web</h3>
              <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500 text-xs">
                {webPorCidade.reduce((total, cidade) => total + cidade.alertas.length, 0)} alertas
              </Badge>
            </div>
            {isWebExpanded ? (
              <ChevronUp className="w-4 h-4 text-blue-300 group-hover:text-white transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-300 group-hover:text-white transition-colors" />
            )}
          </div>
          
          {isWebExpanded && (
            <>
              {isLoadingWeb ? (
                <div className="bg-cyan-500/5 border-l-4 border-l-cyan-500 rounded-lg p-4 text-center">
                  <p className="text-cyan-300 text-sm">🔄 Carregando dados...</p>
                </div>
    ) : webPorCidade.length === 0 ? (
      <div className="bg-cyan-500/5 border-l-4 border-l-cyan-500 rounded-lg p-4 text-center">
        <p className="text-cyan-300 text-sm">📅 Nenhum dado encontrado para esta data</p>
        <p className="text-blue-300 text-xs mt-2">
          Data selecionada: {dataSelecionada.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          {prefeituraFiltro && ` • Prefeitura: ${prefeituraFiltro}`}
        </p>
      </div>
              ) : (
                <div className="space-y-4">
                  {webPorCidade.map((cidadeData) => (
                    <div key={cidadeData.cidade} className="bg-cyan-500/5 border-l-4 border-l-cyan-500 rounded-lg p-4">
                      <div className="mb-3 pb-2 border-b border-cyan-500/30">
                        <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                          📍 {cidadeData.cidade}
                          <Badge className="bg-cyan-600/30 text-cyan-300 text-xs">
                            {cidadeData.alertas.length} alerta{cidadeData.alertas.length > 1 ? 's' : ''}
                          </Badge>
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {cidadeData.alertas.map((alerta) => (
                          <div key={alerta.id} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all duration-200">
                            <p className="text-blue-200 text-xs leading-relaxed mb-2">
                              {alerta.resumo}
                            </p>

                            {alerta.tema && (
                              <div className="mb-2">
                                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/50 text-xs">
                                  🏷️ {alerta.tema}
                                </Badge>
                              </div>
                            )}

                            <div className="flex items-center justify-end mt-2 pt-2 border-t border-cyan-500/20">
                              <span className="text-cyan-400 text-xs">
                                📅 {alerta.data_formatada}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
