import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, X } from 'lucide-react';
import { useCalendarioEventos, CalendarioEvento } from '@/hooks/useCalendarioEventos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId: string;
  dataSelecionada?: Date;
  evento?: CalendarioEvento | null;
}

export const EventoDialog: React.FC<EventoDialogProps> = ({
  open,
  onOpenChange,
  clienteId,
  dataSelecionada,
  evento
}) => {
  const [nomeEvento, setNomeEvento] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [horaEvento, setHoraEvento] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [publicoAlvo, setPublicoAlvo] = useState('');
  const [tipo, setTipo] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [novaHashtag, setNovaHashtag] = useState('');

  const { criarEvento, atualizarEvento, deletarEvento, isCreating, isUpdating, isDeleting } = useCalendarioEventos(clienteId);

  const isEdit = !!evento;

  useEffect(() => {
    if (evento) {
      setNomeEvento(evento.nome_evento);
      setDataEvento(evento.data_evento);
      setHoraEvento(evento.hora_evento);
      setObjetivo(evento.objetivo || '');
      setMensagem(evento.mensagem || '');
      setPublicoAlvo(evento.publico_alvo || '');
      setTipo(evento.tipo || '');
      setHashtags(evento.hashtags || []);
    } else if (dataSelecionada) {
      setDataEvento(format(dataSelecionada, 'yyyy-MM-dd'));
      setNomeEvento('');
      setHoraEvento('');
      setObjetivo('');
      setMensagem('');
      setPublicoAlvo('');
      setTipo('');
      setHashtags([]);
    }
  }, [evento, dataSelecionada]);

  const handleAddHashtag = () => {
    if (novaHashtag.trim() && !hashtags.includes(novaHashtag.trim())) {
      setHashtags([...hashtags, novaHashtag.trim()]);
      setNovaHashtag('');
    }
  };

  const handleRemoveHashtag = (hashtagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== hashtagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeEvento.trim() || !dataEvento || !horaEvento) {
      return;
    }

    const eventData = {
      cliente_id: clienteId,
      nome_evento: nomeEvento.trim(),
      data_evento: dataEvento,
      hora_evento: horaEvento,
      objetivo: objetivo.trim() || undefined,
      mensagem: mensagem.trim() || undefined,
      publico_alvo: publicoAlvo.trim() || undefined,
      tipo: tipo.trim() || undefined,
      hashtags: hashtags.length > 0 ? hashtags : undefined,
    };

    if (isEdit) {
      atualizarEvento({ id: evento!.id, ...eventData });
    } else {
      criarEvento(eventData);
    }

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (evento && window.confirm('Tem certeza que deseja excluir este evento?')) {
      deletarEvento(evento.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Evento' : 'Novo Evento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Evento *</Label>
              <Input
                id="nome"
                value={nomeEvento}
                onChange={(e) => setNomeEvento(e.target.value)}
                placeholder="Ex: Reunião da equipe"
                required
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Input
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                placeholder="Ex: Reunião, Evento, Workshop"
              />
            </div>

            <div>
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={dataEvento}
                onChange={(e) => setDataEvento(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="hora">Hora *</Label>
              <Input
                id="hora"
                type="time"
                value={horaEvento}
                onChange={(e) => setHoraEvento(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="objetivo">Objetivo</Label>
            <Input
              id="objetivo"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Qual o objetivo deste evento?"
            />
          </div>

          <div>
            <Label htmlFor="publico">Público Alvo</Label>
            <Input
              id="publico"
              value={publicoAlvo}
              onChange={(e) => setPublicoAlvo(e.target.value)}
              placeholder="Para quem é direcionado este evento?"
            />
          </div>

          <div>
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Descrição detalhada do evento"
              rows={3}
            />
          </div>

          <div>
            <Label>Hashtags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={novaHashtag}
                onChange={(e) => setNovaHashtag(e.target.value)}
                placeholder="Digite uma hashtag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddHashtag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddHashtag}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((hashtag, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  #{hashtag}
                  <button
                    type="button"
                    onClick={() => handleRemoveHashtag(hashtag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {isEdit && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating || !nomeEvento.trim() || !dataEvento || !horaEvento}
              >
                {isEdit ? 'Atualizar' : 'Criar'} Evento
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};