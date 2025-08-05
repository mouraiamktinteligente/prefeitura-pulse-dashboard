import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useClients } from '@/hooks/useClients';
import { useDocumentosAnalisados } from '@/hooks/useDocumentosAnalisados';
import { useMarketingCampanhas } from '@/hooks/useMarketingCampanhas';

export const MarketingCampanhaForm = () => {
  const [clienteId, setClienteId] = useState('');
  const [tipoSolicitacao, setTipoSolicitacao] = useState<'analise' | 'descricao_personalizada'>('analise');
  const [documentoAnaliseId, setDocumentoAnaliseId] = useState('');
  const [descricaoPersonalizada, setDescricaoPersonalizada] = useState('');
  const [tipoPostagem, setTipoPostagem] = useState<'feed' | 'story' | 'ambos'>('feed');

  const { clients: clientes } = useClients();
  const { documentos, fetchDocumentos } = useDocumentosAnalisados();
  const { criarCampanha, isCreating } = useMarketingCampanhas();

  // Buscar documentos quando cliente for selecionado e tipo for análise
  React.useEffect(() => {
    if (clienteId && tipoSolicitacao === 'analise') {
      fetchDocumentos(clienteId);
    }
  }, [clienteId, tipoSolicitacao, fetchDocumentos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clienteId) return;

    criarCampanha({
      cliente_id: clienteId,
      tipo_solicitacao: tipoSolicitacao,
      documento_analise_id: tipoSolicitacao === 'analise' ? documentoAnaliseId : undefined,
      descricao_personalizada: tipoSolicitacao === 'descricao_personalizada' ? descricaoPersonalizada : undefined,
      tipo_postagem: tipoPostagem,
    });

    // Reset form
    setClienteId('');
    setDocumentoAnaliseId('');
    setDescricaoPersonalizada('');
    setTipoPostagem('feed');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Campanha de Marketing</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção de Cliente */}
          <div>
            <Label htmlFor="cliente">Cliente</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes?.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome_completo} - {cliente.endereco_cidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Solicitação */}
          <div>
            <Label>Tipo de Solicitação</Label>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant={tipoSolicitacao === 'analise' ? 'default' : 'outline'}
                onClick={() => setTipoSolicitacao('analise')}
              >
                📊 Análise
              </Button>
              <Button
                type="button"
                variant={tipoSolicitacao === 'descricao_personalizada' ? 'default' : 'outline'}
                onClick={() => setTipoSolicitacao('descricao_personalizada')}
              >
                ✍️ Descrição Personalizada
              </Button>
            </div>
          </div>

          {/* Campo condicional baseado no tipo */}
          {tipoSolicitacao === 'analise' && (
            <div>
              <Label htmlFor="documento">Documento Analisado</Label>
              <Select value={documentoAnaliseId} onValueChange={setDocumentoAnaliseId}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    !clienteId 
                      ? "Selecione um cliente primeiro"
                      : documentos?.length === 0 
                        ? "Nenhum documento encontrado"
                        : "Selecione um documento"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {documentos?.filter(doc => doc.status === 'concluído').map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.nome_arquivo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clienteId && documentos?.filter(doc => doc.status === 'concluído').length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Este cliente não possui análises concluídas.
                </p>
              )}
            </div>
          )}

          {tipoSolicitacao === 'descricao_personalizada' && (
            <div>
              <Label htmlFor="descricao">Descrição Personalizada</Label>
              <Textarea
                id="descricao"
                value={descricaoPersonalizada}
                onChange={(e) => setDescricaoPersonalizada(e.target.value)}
                placeholder="Digite aqui o conteúdo para gerar as imagens..."
                rows={4}
              />
            </div>
          )}

          {/* Tipo de Postagem */}
          <div>
            <Label>Tipo de Postagem</Label>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant={tipoPostagem === 'feed' ? 'default' : 'outline'}
                onClick={() => setTipoPostagem('feed')}
              >
                📱 Feed
              </Button>
              <Button
                type="button"
                variant={tipoPostagem === 'story' ? 'default' : 'outline'}
                onClick={() => setTipoPostagem('story')}
              >
                📖 Story
              </Button>
              <Button
                type="button"
                variant={tipoPostagem === 'ambos' ? 'default' : 'outline'}
                onClick={() => setTipoPostagem('ambos')}
              >
                📱📖 Ambos
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={
              !clienteId || 
              isCreating || 
              (tipoSolicitacao === 'analise' && !documentoAnaliseId) || 
              (tipoSolicitacao === 'descricao_personalizada' && !descricaoPersonalizada)
            }
            className="w-full"
          >
            {isCreating ? 'Criando Campanha...' : 'Criar Campanha'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};