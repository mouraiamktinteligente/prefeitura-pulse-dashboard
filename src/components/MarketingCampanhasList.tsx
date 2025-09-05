import React, { useState } from 'react';
import { useMarketingCampanhas } from '@/hooks/useMarketingCampanhas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, Eye } from 'lucide-react';
import { MarketingCampanhaDetail } from './MarketingCampanhaDetail';

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
  const { campanhas, isLoading, excluirCampanha, isDeleting } = useMarketingCampanhas();
  const [selectedCampanha, setSelectedCampanha] = useState<any>(null);

  const handleDelete = (campanhaId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.')) {
      excluirCampanha(campanhaId);
    }
  };

  const handleViewDetails = (campanha: any, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedCampanha(campanha);
  };

  if (isLoading) {
    return <div>Carregando campanhas...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Campanhas de Marketing</h2>
      
      {campanhas && campanhas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campanhas.map((campanha) => (
            <Card key={campanha.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle 
                      className="text-lg cursor-pointer hover:text-primary transition-colors"
                      onClick={(e) => handleViewDetails(campanha, e)}
                    >
                      {campanha.cadastro_clientes?.nome_completo || 'Cliente não encontrado'}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {campanha.cadastro_clientes?.endereco_cidade}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleViewDetails(campanha, e)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(campanha.id, e)}
                      disabled={isDeleting}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(campanha.status_campanha)}>
                    {getStatusText(campanha.status_campanha)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <span>{getTipoPostagemIcon(campanha.tipo_postagem)}</span>
                  <span>{campanha.tipo_postagem}</span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <strong>Tipo:</strong> {campanha.tipo_solicitacao}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Criado em: {format(new Date(campanha.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma campanha encontrada.
        </div>
      )}

      {/* Modal de Detalhes */}
      <MarketingCampanhaDetail
        campanha={selectedCampanha}
        isOpen={!!selectedCampanha}
        onClose={() => setSelectedCampanha(null)}
      />
    </div>
  );
};