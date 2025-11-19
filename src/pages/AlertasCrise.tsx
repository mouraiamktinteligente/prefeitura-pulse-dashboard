import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Clock, CheckCircle2, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAlertasCriseMes, calcularTempoResposta } from '@/hooks/useAlertasCrise';

const AlertasCrise = () => {
  const hoje = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(hoje.getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(hoje.getFullYear());
  
  const { data: alertas, isLoading } = useAlertasCriseMes(mesSelecionado, anoSelecionado);

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  const anos = Array.from({ length: 3 }, (_, i) => hoje.getFullYear() - i);

  const alertasAtivos = alertas?.filter(a => !a.alerta_visualizado) || [];
  const alertasResolvidos = alertas?.filter(a => a.alerta_visualizado) || [];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="container mx-auto space-y-6">
        {/* Header com Filtros */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Alertas de Crise</h1>
            <p className="text-gray-400">
              Histórico de alertas e ações tomadas
            </p>
          </div>

          <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-700">
            <Filter className="w-5 h-5 text-gray-300" />
            <Select value={String(mesSelecionado)} onValueChange={(v) => setMesSelecionado(Number(v))}>
              <SelectTrigger className="w-[140px] bg-gray-700/50 text-white border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {meses.map(mes => (
                  <SelectItem key={mes.value} value={String(mes.value)}>
                    {mes.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(anoSelecionado)} onValueChange={(v) => setAnoSelecionado(Number(v))}>
              <SelectTrigger className="w-[100px] bg-gray-700/50 text-white border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {anos.map(ano => (
                  <SelectItem key={ano} value={String(ano)}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total de Alertas</p>
                  <p className="text-3xl font-bold text-white">{alertas?.length || 0}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-900/50 backdrop-blur-sm border-red-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-300 text-sm">Aguardando Resposta</p>
                  <p className="text-3xl font-bold text-white">{alertasAtivos.length}</p>
                </div>
                <Clock className="w-12 h-12 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-900/50 backdrop-blur-sm border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm">Resolvidos</p>
                  <p className="text-3xl font-bold text-white">{alertasResolvidos.length}</p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Alertas */}
        {isLoading ? (
          <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700">
            <CardContent className="py-12 text-center text-white">
              Carregando alertas...
            </CardContent>
          </Card>
        ) : alertas && alertas.length > 0 ? (
          <div className="space-y-4">
            {/* Alertas Ativos */}
            {alertasAtivos.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-3">
                  Alertas Ativos ({alertasAtivos.length})
                </h2>
                {alertasAtivos.map(alerta => (
                  <div key={alerta.id} className="bg-red-500/10 border-l-4 border-l-red-500 rounded-lg p-4 mb-3 shadow-md hover:shadow-lg transition-shadow">
                    {/* Linha 1: Título + Badges */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                          <h3 className="text-lg font-semibold text-white">{alerta.prefeitura}</h3>
                          <Badge className="bg-red-600 text-white border-red-500">ATIVO</Badge>
                          {alerta.sentiment_score && (
                            <Badge className="bg-red-600/30 text-red-200 border border-red-500/50">
                              Score: {alerta.sentiment_score}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-blue-300">
                          {format(new Date(alerta.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge className="bg-blue-700/50 text-blue-200 border-blue-500/50">
                        {alerta.origem || 'Não especificado'}
                      </Badge>
                    </div>

                    {/* Linha 2: Tema */}
                    {alerta.tema && (
                      <div className="mb-3 pt-3 border-t border-red-500/30">
                        <p className="text-red-300 text-xs font-medium mb-1">Tema:</p>
                        <Badge className="bg-red-600/30 text-red-200 border border-red-500/50">
                          {alerta.tema}
                        </Badge>
                      </div>
                    )}

                    {/* Linha 3: Resumo */}
                    <div className="pt-3 border-t border-red-500/30">
                      <p className="text-red-300 text-xs font-medium mb-1">Resumo:</p>
                      <p className="text-blue-100 text-sm leading-relaxed">{alerta.resumo}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Alertas Resolvidos */}
            {alertasResolvidos.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-3">
                  Alertas Resolvidos ({alertasResolvidos.length})
                </h2>
                {alertasResolvidos.map(alerta => (
                  <div key={alerta.id} className="bg-green-500/10 border-l-4 border-l-green-500 rounded-lg p-4 mb-3 shadow-md hover:shadow-lg transition-shadow">
                    {/* Linha 1: Título + Badges */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                          <h3 className="text-lg font-semibold text-white">{alerta.prefeitura}</h3>
                          <Badge className="bg-green-600 text-white border-green-500">RESOLVIDO</Badge>
                          {alerta.sentiment_score && (
                            <Badge className="bg-green-600/30 text-green-200 border border-green-500/50">
                              Score: {alerta.sentiment_score}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Datas e Tempo de Resposta */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-blue-300">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-green-400" />
                            <span>Criado: {format(new Date(alerta.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                          </div>
                          {alerta.hora_acao && (
                            <>
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-400" />
                                <span>Resolvido: {format(new Date(alerta.hora_acao), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                              </div>
                              <Badge className="bg-green-600 text-white">
                                ⏱️ {calcularTempoResposta(alerta.created_at, alerta.hora_acao)}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-blue-700/50 text-blue-200 border-blue-500/50">
                        {alerta.origem || 'Não especificado'}
                      </Badge>
                    </div>

                    {/* Linha 2: Tema */}
                    {alerta.tema && (
                      <div className="mb-3 pt-3 border-t border-green-500/30">
                        <p className="text-green-300 text-xs font-medium mb-1">Tema:</p>
                        <Badge className="bg-green-600/30 text-green-200 border border-green-500/50">
                          {alerta.tema}
                        </Badge>
                      </div>
                    )}

                    {/* Linha 3: Resumo */}
                    <div className="pt-3 border-t border-green-500/30">
                      <p className="text-green-300 text-xs font-medium mb-1">Resumo:</p>
                      <p className="text-blue-100 text-sm leading-relaxed">{alerta.resumo}</p>
                    </div>

                    {/* Linha 4: Ação Tomada */}
                    {alerta.acao_tomada && (
                      <div className="mt-3 pt-3 border-t border-green-500/30">
                        <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-3">
                          <p className="text-green-300 text-xs font-medium mb-2">✅ Ação Tomada:</p>
                          <p className="text-blue-100 text-sm leading-relaxed">{alerta.acao_tomada}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700">
            <CardContent className="py-12 text-center">
              <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <p className="text-white text-lg">
                Nenhum alerta encontrado para o período selecionado
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AlertasCrise;