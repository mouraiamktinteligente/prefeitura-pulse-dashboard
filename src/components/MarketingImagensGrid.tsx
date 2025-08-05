import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useMarketingImagens } from '@/hooks/useMarketingImagens';
import { Check, X, Eye } from 'lucide-react';

interface MarketingImagensGridProps {
  campanhaId: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pendente':
      return 'bg-yellow-500';
    case 'aprovada':
      return 'bg-green-500';
    case 'rejeitada':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getTipoImagemIcon = (tipo: string) => {
  return tipo === 'feed' ? '📱' : '📖';
};

export const MarketingImagensGrid = ({ campanhaId }: MarketingImagensGridProps) => {
  const { imagens, isLoading, aprovarImagem, rejeitarImagem, isApproving, isRejecting } = useMarketingImagens(campanhaId);
  const [observacoes, setObservacoes] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null);

  if (isLoading) {
    return <div>Carregando imagens...</div>;
  }

  if (!imagens || imagens.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Nenhuma imagem gerada ainda para esta campanha.</p>
        </CardContent>
      </Card>
    );
  }

  const handleRejeitar = (imagemId: string) => {
    rejeitarImagem({ imagemId, observacoes });
    setObservacoes('');
    setImagemSelecionada(null);
  };

  // Agrupar imagens por tipo
  const imagensFeed = imagens.filter(img => img.tipo_imagem === 'feed');
  const imagensStory = imagens.filter(img => img.tipo_imagem === 'story');

  return (
    <div className="space-y-6">
      {imagensFeed.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
            📱 Imagens Feed
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {imagensFeed.map((imagem) => (
              <Card key={imagem.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={imagem.url_imagem}
                    alt="Imagem gerada"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(imagem.status_aprovacao)}>
                      {imagem.status_aprovacao}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      v{imagem.versao}
                    </span>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Visualizar Imagem</DialogTitle>
                          </DialogHeader>
                          <img
                            src={imagem.url_imagem}
                            alt="Imagem gerada"
                            className="w-full h-auto"
                          />
                        </DialogContent>
                      </Dialog>
                      
                      {imagem.status_aprovacao === 'pendente' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => aprovarImagem(imagem.id)}
                            disabled={isApproving}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setImagemSelecionada(imagem.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Rejeitar Imagem</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  placeholder="Observações sobre a rejeição (opcional)"
                                  value={observacoes}
                                  onChange={(e) => setObservacoes(e.target.value)}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleRejeitar(imagem.id)}
                                    disabled={isRejecting}
                                    variant="destructive"
                                  >
                                    Rejeitar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setImagemSelecionada(null);
                                      setObservacoes('');
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {imagem.observacoes_rejeicao && (
                    <p className="text-xs text-red-600 mt-2">
                      {imagem.observacoes_rejeicao}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {imagensStory.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
            📖 Imagens Story
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {imagensStory.map((imagem) => (
              <Card key={imagem.id} className="overflow-hidden">
                <div className="aspect-[9/16] relative">
                  <img
                    src={imagem.url_imagem}
                    alt="Imagem gerada"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(imagem.status_aprovacao)}>
                      {imagem.status_aprovacao}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      v{imagem.versao}
                    </span>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Visualizar Imagem</DialogTitle>
                          </DialogHeader>
                          <img
                            src={imagem.url_imagem}
                            alt="Imagem gerada"
                            className="w-full h-auto"
                          />
                        </DialogContent>
                      </Dialog>
                      
                      {imagem.status_aprovacao === 'pendente' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => aprovarImagem(imagem.id)}
                            disabled={isApproving}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setImagemSelecionada(imagem.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Rejeitar Imagem</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  placeholder="Observações sobre a rejeição (opcional)"
                                  value={observacoes}
                                  onChange={(e) => setObservacoes(e.target.value)}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleRejeitar(imagem.id)}
                                    disabled={isRejecting}
                                    variant="destructive"
                                  >
                                    Rejeitar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setImagemSelecionada(null);
                                      setObservacoes('');
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {imagem.observacoes_rejeicao && (
                    <p className="text-xs text-red-600 mt-2">
                      {imagem.observacoes_rejeicao}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};