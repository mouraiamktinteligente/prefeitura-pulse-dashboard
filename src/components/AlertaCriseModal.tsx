import React, { useState } from 'react';
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
  alerta: AlertaCrise | null;
}

export const AlertaCriseModal: React.FC<AlertaCriseModalProps> = ({
  open,
  onOpenChange,
  alerta,
}) => {
  const [acaoDescricao, setAcaoDescricao] = useState('');
  const marcarVisualizado = useMarcarAlertaVisualizado();

  const handleEnviar = async () => {
    if (!alerta || !acaoDescricao.trim()) {
      return;
    }

    await marcarVisualizado.mutateAsync({
      alertaId: alerta.id,
      acaoTomada: acaoDescricao,
    });

    setAcaoDescricao('');
    onOpenChange(false);
  };

  if (!alerta) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Alerta de Crise Detectado
          </DialogTitle>
          <DialogDescription>
            Registre a ação tomada para resolver este alerta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do Alerta */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Assunto do Alerta:</h3>
                <p className="text-gray-700">{alerta.resumo}</p>
              </div>
              {alerta.sentiment_score && (
                <Badge variant="destructive">
                  Score: {alerta.sentiment_score}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-red-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Origem:</p>
                  <p className="text-sm font-medium">{alerta.origem || 'Não especificado'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Enviado em:</p>
                  <p className="text-sm font-medium">
                    {format(new Date(alerta.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>

            {alerta.tema && (
              <div className="pt-2 border-t border-red-200">
                <p className="text-xs text-gray-500">Tema:</p>
                <p className="text-sm font-medium">{alerta.tema}</p>
              </div>
            )}
          </div>

          {/* Campo para Ação */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Descreva a ação que será tomada:
            </label>
            <Textarea
              value={acaoDescricao}
              onChange={(e) => setAcaoDescricao(e.target.value)}
              placeholder="Ex: Reunião emergencial agendada com equipe de comunicação para preparar nota oficial de esclarecimento sobre o assunto..."
              className="min-h-[120px]"
              required
            />
          </div>

          {/* Botão Enviar */}
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {marcarVisualizado.isPending ? 'Enviando...' : 'Enviar Ação'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};