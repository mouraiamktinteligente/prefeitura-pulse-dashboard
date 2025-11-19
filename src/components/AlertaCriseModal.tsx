import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AlertaCrise } from '@/hooks/useAlertasCrise';
import { useMarcarAlertaVisualizado } from '@/hooks/useAlertasCrise';

interface AlertaCriseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alertas: AlertaCrise[];
}

export const AlertaCriseModal: React.FC<AlertaCriseModalProps> = ({
  open,
  onOpenChange,
  alertas,
}) => {
  const [acaoDescricao, setAcaoDescricao] = useState('');
  const [alertaIndex, setAlertaIndex] = useState(0);
  const marcarVisualizado = useMarcarAlertaVisualizado();

  // Reset index when modal opens or alertas change
  useEffect(() => {
    if (open) {
      setAlertaIndex(0);
      setAcaoDescricao('');
    }
  }, [open, alertas]);

  const alertaAtual = alertas[alertaIndex];

  const handleEnviar = async () => {
    if (!alertaAtual || !acaoDescricao.trim()) {
      return;
    }

    await marcarVisualizado.mutateAsync({
      alertaId: alertaAtual.id,
      acaoTomada: acaoDescricao,
    });

    setAcaoDescricao('');
    onOpenChange(false);
  };

  // Intercepta tentativas de fechamento não autorizadas
  const handleOpenChange = (newOpen: boolean) => {
    // Bloqueia qualquer tentativa de fechamento
    // Só fecha quando os botões chamarem onOpenChange diretamente
    return;
  };

  if (!alertaAtual || alertas.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={true}>
      <DialogContent 
        className="max-w-2xl max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-500 scrollbar-track-red-100 [&>button]:hidden"
        onInteractOutside={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Alerta de Crise Detectado
          </DialogTitle>
          <DialogDescription className="text-foreground/80">
            Registre a ação tomada para resolver este alerta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Navegação entre múltiplos alertas */}
          {alertas.length > 1 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <p className="text-foreground font-medium text-sm">
                  Alerta {alertaIndex + 1} de {alertas.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAlertaIndex(Math.max(0, alertaIndex - 1))}
                    disabled={alertaIndex === 0}
                    className="bg-red-600/20 border-red-500 text-foreground hover:bg-red-600/40"
                  >
                    ← Anterior
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAlertaIndex(Math.min(alertas.length - 1, alertaIndex + 1))}
                    disabled={alertaIndex === alertas.length - 1}
                    className="bg-red-600/20 border-red-500 text-foreground hover:bg-red-600/40"
                  >
                    Próximo →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Informações do Alerta - Redesign com padrão visual */}
          <div className="bg-red-500/10 border-l-4 border-l-red-500 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2 text-base">
                  Assunto do Alerta:
                </h3>
                <p className="text-foreground/90 text-sm leading-relaxed">
                  {alertaAtual.resumo}
                </p>
              </div>
              {alertaAtual.sentiment_score && (
                <Badge variant="destructive" className="bg-red-600 text-white border-red-500 shrink-0">
                  Score: {alertaAtual.sentiment_score}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-red-500/30">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 text-xs font-medium mb-1">Origem:</p>
                  <p className="text-foreground text-sm">{alertaAtual.origem || 'Não especificado'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 text-xs font-medium mb-1">Enviado em:</p>
                  <p className="text-foreground text-sm">
                    {format(new Date(alertaAtual.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>

            {alertaAtual.tema && (
              <div className="pt-3 border-t border-red-500/30">
                <p className="text-red-300 text-xs font-medium mb-1">Tema:</p>
                <Badge className="bg-red-600/30 text-red-200 border border-red-500/50">
                  {alertaAtual.tema}
                </Badge>
              </div>
            )}
          </div>

          {/* Campo para Ação */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Descreva a ação que será tomada:
            </label>
            <Textarea
              value={acaoDescricao}
              onChange={(e) => setAcaoDescricao(e.target.value)}
              placeholder="Ex: Reunião emergencial agendada com equipe de comunicação para preparar nota oficial de esclarecimento sobre o assunto..."
              className="min-h-[120px] bg-background border-input text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEnviar}
              disabled={!acaoDescricao.trim() || marcarVisualizado.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {marcarVisualizado.isPending ? 'Enviando...' : 'Enviar Ação'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};