import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useMarketingImagens } from '@/hooks/useMarketingImagens';
import { useMarketingCampanhas } from '@/hooks/useMarketingCampanhas';
import { useToast } from '@/hooks/use-toast';

interface MarketingCampanhaDetailProps {
  campanha: any;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'aprovada':
      return 'bg-green-500';
    case 'rejeitada':
      return 'bg-red-500';
    case 'pendente':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'aprovada':
      return 'Aprovada';
    case 'rejeitada':
      return 'Rejeitada';
    case 'pendente':
      return 'Pendente';
    default:
      return 'Desconhecido';
  }
};

export const MarketingCampanhaDetail: React.FC<MarketingCampanhaDetailProps> = ({
  campanha,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [showObservacoes, setShowObservacoes] = useState<'imagem' | 'descricao' | null>(null);

  const { 
    imagens, 
    isLoading,
    aprovarImagem,
    rejeitarImagem,
    aprovarDescricao,
    rejeitarDescricao,
    isApproving,
    isRejecting,
    isApprovingDescription,
    isRejectingDescription
  } = useMarketingImagens(campanha?.id);

  const { excluirCampanha, isDeleting } = useMarketingCampanhas();

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      toast({
        title: "Texto copiado",
        description: "O texto foi copiado para a área de transferência",
      });
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.')) {
      excluirCampanha(campanha.id);
      onClose();
    }
  };

  const handleAprovarImagem = (imagemId: string) => {
    aprovarImagem(imagemId);
  };

  const handleRejeitarImagem = (imagemId: string) => {
    if (showObservacoes === 'imagem') {
      rejeitarImagem({ imagemId, observacoes });
      setObservacoes('');
      setShowObservacoes(null);
    } else {
      setShowObservacoes('imagem');
    }
  };

  const handleAprovarDescricao = (imagemId: string) => {
    aprovarDescricao(imagemId);
  };

  const handleRejeitarDescricao = (imagemId: string) => {
    if (showObservacoes === 'descricao') {
      rejeitarDescricao({ imagemId, observacoes });
      setObservacoes('');
      setShowObservacoes(null);
    } else {
      setShowObservacoes('descricao');
    }
  };

  if (!campanha) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              Detalhes da Campanha - {campanha.cadastro_clientes?.nome_completo}
            </DialogTitle>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Excluindo...' : 'Excluir Campanha'}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da Campanha */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Campanha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <strong>Cliente:</strong> {campanha.cadastro_clientes?.nome_completo}
              </div>
              <div>
                <strong>Cidade:</strong> {campanha.cadastro_clientes?.endereco_cidade}
              </div>
              <div>
                <strong>Tipo de Solicitação:</strong> {campanha.tipo_solicitacao}
              </div>
              <div>
                <strong>Tipo de Postagem:</strong> {campanha.tipo_postagem}
              </div>
              <div>
                <strong>Status:</strong> 
                <Badge className={`ml-2 ${getStatusColor(campanha.status_campanha)}`}>
                  {getStatusText(campanha.status_campanha)}
                </Badge>
              </div>
              <div>
                <strong>Criado em:</strong> {new Date(campanha.created_at).toLocaleString('pt-BR')}
              </div>
            </CardContent>
          </Card>

          {/* Imagens e Descrições Geradas */}
          {isLoading ? (
            <div className="text-center py-8">Carregando imagens...</div>
          ) : imagens && imagens.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {imagens.map((imagem) => (
                <Card key={imagem.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Imagem Gerada</span>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(imagem.status_aprovacao)}>
                          Imagem: {getStatusText(imagem.status_aprovacao)}
                        </Badge>
                        <Badge className={getStatusColor(imagem.status_aprovacao_descricao)}>
                          Descrição: {getStatusText(imagem.status_aprovacao_descricao)}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Imagem */}
                    <div className="space-y-2">
                      <img
                        src={imagem.url_imagem}
                        alt="Imagem gerada"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      
                      {/* Botões de Aprovação da Imagem */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAprovarImagem(imagem.id)}
                          disabled={isApproving || imagem.status_aprovacao === 'aprovada'}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {isApproving ? 'Aprovando...' : 'Aprovar Imagem'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejeitarImagem(imagem.id)}
                          disabled={isRejecting || imagem.status_aprovacao === 'rejeitada'}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          {isRejecting ? 'Rejeitando...' : 'Rejeitar Imagem'}
                        </Button>
                      </div>
                    </div>

                    {/* Descrição */}
                    {imagem.descricao_gerada && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Descrição Gerada:</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(imagem.descricao_gerada, `desc-${imagem.id}`)}
                          >
                            {copiedText === `desc-${imagem.id}` ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                          {imagem.descricao_gerada}
                        </div>
                        
                        {/* Botões de Aprovação da Descrição */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAprovarDescricao(imagem.id)}
                            disabled={isApprovingDescription || imagem.status_aprovacao_descricao === 'aprovada'}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {isApprovingDescription ? 'Aprovando...' : 'Aprovar Descrição'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejeitarDescricao(imagem.id)}
                            disabled={isRejectingDescription || imagem.status_aprovacao_descricao === 'rejeitada'}
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            {isRejectingDescription ? 'Rejeitando...' : 'Rejeitar Descrição'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Campo de Observações */}
                    {showObservacoes && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Observações para rejeição:
                        </label>
                        <Textarea
                          value={observacoes}
                          onChange={(e) => setObservacoes(e.target.value)}
                          placeholder="Digite as observações sobre a rejeição..."
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              if (showObservacoes === 'imagem') {
                                handleRejeitarImagem(imagem.id);
                              } else {
                                handleRejeitarDescricao(imagem.id);
                              }
                            }}
                          >
                            Confirmar Rejeição
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowObservacoes(null);
                              setObservacoes('');
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Observações de Rejeição */}
                    {imagem.observacoes_rejeicao && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h5 className="font-medium text-red-800 mb-1">Observações da Rejeição:</h5>
                        <p className="text-sm text-red-700">{imagem.observacoes_rejeicao}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma imagem gerada encontrada para esta campanha.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};