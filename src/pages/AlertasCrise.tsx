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
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 p-6">
      <div className="container mx-auto space-y-6">
        {/* Header com Filtros */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Alertas de Crise</h1>
            <p className="text-blue-300">
              Histórico de alertas e ações tomadas
            </p>
          </div>

          <div className="flex items-center gap-3 bg-blue-800/50 backdrop-blur-sm p-4 rounded-lg border border-blue-700">
            <Filter className="w-5 h-5 text-blue-300" />
            <Select value={String(mesSelecionado)} onValueChange={(v) => setMesSelecionado(Number(v))}>
              <SelectTrigger className="w-[140px] bg-blue-700/50 text-white border-blue-600">
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
              <SelectTrigger className="w-[100px] bg-blue-700/50 text-white border-blue-600">
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
          <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm">Total de Alertas</p>
                  <p className="text-3xl font-bold text-white">{alertas?.length || 0}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-blue-400" />
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
                  <Card key={alerta.id} className="bg-red-50 border-red-300 mb-3">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <CardTitle className="text-lg">{alerta.prefeitura}</CardTitle>
                            <Badge variant="destructive">ATIVO</Badge>
                            {alerta.sentiment_score && (
                              <Badge variant="outline">Score: {alerta.sentiment_score}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {format(new Date(alerta.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <Badge variant="secondary">{alerta.origem || 'Não especificado'}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {alerta.tema && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Tema:</p>
                            <p className="text-sm text-gray-600">{alerta.tema}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Resumo:</p>
                          <p className="text-sm text-gray-600">{alerta.resumo}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                  <Card key={alerta.id} className="bg-white border-gray-300 mb-3">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <CardTitle className="text-lg">{alerta.prefeitura}</CardTitle>
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              RESOLVIDO
                            </Badge>
                            {alerta.sentiment_score && (
                              <Badge variant="secondary">Score: {alerta.sentiment_score}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              Criado: {format(new Date(alerta.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </span>
                            {alerta.hora_acao && (
                              <span>
                                Resolvido: {format(new Date(alerta.hora_acao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </span>
                            )}
                            <span className="font-semibold text-blue-600">
                              Tempo de resposta: {calcularTempoResposta(alerta.created_at, alerta.hora_acao)}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary">{alerta.origem || 'Não especificado'}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {alerta.tema && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Tema:</p>
                            <p className="text-sm text-gray-600">{alerta.tema}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Resumo:</p>
                          <p className="text-sm text-gray-600">{alerta.resumo}</p>
                        </div>
                        {alerta.acao_tomada && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <p className="text-sm font-semibold text-blue-800 mb-1">Ação Tomada:</p>
                            <p className="text-sm text-blue-700">{alerta.acao_tomada}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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