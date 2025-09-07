import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMarketingCampanhas } from '@/hooks/useMarketingCampanhas';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'enviada':
      return 'bg-blue-500';
    case 'processando':
      return 'bg-yellow-500';
    case 'concluida':
      return 'bg-green-500';
    case 'erro':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'enviada':
      return 'Enviada';
    case 'processando':
      return 'Processando';
    case 'concluida':
      return 'Concluída';
    case 'erro':
      return 'Erro';
    default:
      return status;
  }
};

const getTipoPostagemIcon = (tipo: string) => {
  switch (tipo) {
    case 'feed':
      return '📱';
    case 'story':
      return '📖';
    case 'ambos':
      return '📱📖';
    default:
      return '📱';
  }
};

export const MarketingCampanhasList = () => {
  const { campanhas, isLoading } = useMarketingCampanhas();

  if (isLoading) {
    return <div>Carregando campanhas...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Campanhas Recentes</h3>
      
      {!campanhas || campanhas.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma campanha criada ainda.</p>
      ) : (
        campanhas.map((campanha) => (
          <Card key={campanha.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">
                    {campanha.cadastro_clientes?.nome_completo}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {campanha.cadastro_clientes?.endereco_cidade}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(campanha.status_campanha)}>
                    {getStatusText(campanha.status_campanha)}
                  </Badge>
                  <Badge variant="outline">
                    {getTipoPostagemIcon(campanha.tipo_postagem)} {campanha.tipo_postagem}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Tipo:</strong> {campanha.tipo_solicitacao === 'analise' ? '📊 Análise' : '✍️ Descrição Personalizada'}
                </p>
                
                {campanha.tipo_solicitacao === 'analise' && campanha.documentos_analisados && (
                  <p className="text-sm">
                    <strong>Documento:</strong> {campanha.documentos_analisados.nome_arquivo}
                  </p>
                )}
                
                {campanha.tipo_solicitacao === 'descricao_personalizada' && (
                  <p className="text-sm">
                    <strong>Descrição:</strong> {campanha.descricao_personalizada?.substring(0, 100)}...
                  </p>
                )}
                
                <p className="text-xs text-muted-foreground">
                  Criada {formatDistanceToNow(new Date(campanha.created_at), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};