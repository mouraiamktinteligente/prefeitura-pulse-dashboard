import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, Users, Target } from 'lucide-react';
import { useCalendarioEventos, CalendarioEvento } from '@/hooks/useCalendarioEventos';
import { EventoDialog } from './EventoDialog';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarioEventosProps {
  clienteId: string;
  embedded?: boolean;
}

type VisualizationMode = 'anual' | 'mensal' | 'semanal';

export const CalendarioEventos: React.FC<CalendarioEventosProps> = ({ clienteId, embedded = false }) => {
  const [modo, setModo] = useState<VisualizationMode>('mensal');
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>();
  const [eventoDialogOpen, setEventoDialogOpen] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<CalendarioEvento | null>(null);
  const [mesAtual, setMesAtual] = useState(new Date());

  const { eventos, isLoading } = useCalendarioEventos(clienteId);

  const getEventosParaData = (data: Date) => {
    return eventos?.filter(evento => 
      isSameDay(new Date(evento.data_evento), data)
    ) || [];
  };

  const handleDateSelect = (date: Date | undefined) => {
    setDataSelecionada(date);
    if (date) {
      setEventoSelecionado(null);
      setEventoDialogOpen(true);
    }
  };

  const handleEventoClick = (evento: CalendarioEvento) => {
    setEventoSelecionado(evento);
    setEventoDialogOpen(true);
  };

  const renderCalendarioMensal = () => (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={dataSelecionada}
        onSelect={handleDateSelect}
        month={mesAtual}
        onMonthChange={setMesAtual}
        className="rounded-md border bg-card p-3 pointer-events-auto"
        locale={ptBR}
        components={{
          DayContent: ({ date }) => {
            const eventosData = getEventosParaData(date);
            return (
              <div className="relative w-full h-full">
                <span>{date.getDate()}</span>
                {eventosData.length > 0 && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                  </div>
                )}
              </div>
            );
          }
        }}
      />
    </div>
  );

  const renderCalendarioSemanal = () => {
    const startWeek = startOfWeek(mesAtual);
    const endWeek = endOfWeek(mesAtual);
    const daysInWeek = eachDayOfInterval({ start: startWeek, end: endWeek });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {daysInWeek.map((day) => {
            const eventosData = getEventosParaData(day);
            return (
              <Card 
                key={day.toISOString()} 
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleDateSelect(day)}
              >
                <CardContent className="p-2">
                  <div className="text-center">
                    <div className="text-sm font-medium">{format(day, 'EEE', { locale: ptBR }).slice(0, 3)}</div>
                    <div className="text-lg font-bold">{format(day, 'd')}</div>
                    <div className="mt-2 space-y-1">
                      {eventosData.slice(0, 2).map((evento) => (
                        <Badge 
                          key={evento.id}
                          variant="secondary" 
                          className="text-xs cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventoClick(evento);
                          }}
                        >
                          {evento.nome_evento}
                        </Badge>
                      ))}
                      {eventosData.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{eventosData.length - 2} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCalendarioAnual = () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(mesAtual.getFullYear(), i, 1);
      return date;
    });

    return (
      <div className="grid grid-cols-3 gap-4">
        {months.map((month) => (
          <Card 
            key={month.getMonth()} 
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => {
              setMesAtual(month);
              setModo('mensal');
            }}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="font-medium text-sm">
                  {format(month, 'MMMM yyyy', { locale: ptBR })}
                </div>
                <div className="mt-2">
                  <div className="text-xs text-muted-foreground">
                    {eventos?.filter(evento => {
                      const eventoDate = new Date(evento.data_evento);
                      return eventoDate.getMonth() === month.getMonth() && 
                             eventoDate.getFullYear() === month.getFullYear();
                    }).length || 0} eventos
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div>Carregando eventos...</div>;
  }

  if (embedded) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span className="font-medium">Calendário de Eventos</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant={modo === 'anual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setModo('anual')}
            >
              Anual
            </Button>
            <Button
              variant={modo === 'mensal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setModo('mensal')}
            >
              Mensal
            </Button>
            <Button
              variant={modo === 'semanal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setModo('semanal')}
            >
              Semanal
            </Button>
          </div>
        </div>
        
        <div>
          {modo === 'anual' && renderCalendarioAnual()}
          {modo === 'mensal' && renderCalendarioMensal()}
          {modo === 'semanal' && renderCalendarioSemanal()}
        </div>
        
        {/* Lista de eventos do dia selecionado */}
        {dataSelecionada && (
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">
              Eventos para {format(dataSelecionada, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h4>
            <div className="space-y-3">
              {getEventosParaData(dataSelecionada).length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum evento nesta data</p>
              ) : (
                getEventosParaData(dataSelecionada).map((evento) => (
                  <div 
                    key={evento.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors p-3 rounded border"
                    onClick={() => handleEventoClick(evento)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">{evento.nome_evento}</h5>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {evento.hora_evento}
                          </div>
                          {evento.publico_alvo && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {evento.publico_alvo}
                            </div>
                          )}
                        </div>
                        {evento.hashtags && evento.hashtags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {evento.hashtags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      {evento.tipo && (
                        <Badge variant="outline" className="text-xs">{evento.tipo}</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <EventoDialog
          open={eventoDialogOpen}
          onOpenChange={setEventoDialogOpen}
          clienteId={clienteId}
          dataSelecionada={dataSelecionada}
          evento={eventoSelecionado}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Calendário de Eventos
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={modo === 'anual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setModo('anual')}
            >
              Anual
            </Button>
            <Button
              variant={modo === 'mensal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setModo('mensal')}
            >
              Mensal
            </Button>
            <Button
              variant={modo === 'semanal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setModo('semanal')}
            >
              Semanal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {modo === 'anual' && renderCalendarioAnual()}
          {modo === 'mensal' && renderCalendarioMensal()}
          {modo === 'semanal' && renderCalendarioSemanal()}
        </CardContent>
      </Card>

      {/* Lista de eventos do dia selecionado */}
      {dataSelecionada && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Eventos para {format(dataSelecionada, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getEventosParaData(dataSelecionada).length === 0 ? (
                <p className="text-muted-foreground">Nenhum evento nesta data</p>
              ) : (
                getEventosParaData(dataSelecionada).map((evento) => (
                  <Card 
                    key={evento.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleEventoClick(evento)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-medium">{evento.nome_evento}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {evento.hora_evento}
                            </div>
                            {evento.publico_alvo && (
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {evento.publico_alvo}
                              </div>
                            )}
                            {evento.objetivo && (
                              <div className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                {evento.objetivo}
                              </div>
                            )}
                          </div>
                          {evento.hashtags && evento.hashtags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {evento.hashtags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        {evento.tipo && (
                          <Badge variant="outline">{evento.tipo}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <EventoDialog
        open={eventoDialogOpen}
        onOpenChange={setEventoDialogOpen}
        clienteId={clienteId}
        dataSelecionada={dataSelecionada}
        evento={eventoSelecionado}
      />
    </div>
  );
};