
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import type { Cliente } from '@/hooks/useClients';
import { SentimentAnalysis } from './SentimentAnalysis';
import { useClientMetrics } from '@/hooks/useClientMetrics';
import { useInstagramPosts } from '@/hooks/useInstagramPosts';
import { useAlertasAtivos } from '@/hooks/useAlertasCrise';
import { AlertaCriseModal } from './AlertaCriseModal';
import { Button } from '@/components/ui/button';


interface ClientCardProps {
  client: Cliente;
  onClick: () => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedAlertIndex, setSelectedAlertIndex] = useState(0);
  
  const { metrics } = useClientMetrics(client.instagram_prefeitura || undefined);
  const { latestPost, loading: postLoading, error: postError } = useInstagramPosts(client.instagram_prefeitura || undefined);
  const { data: alertas } = useAlertasAtivos(client.instagram_prefeitura, client.instagram_prefeito);
  const navigate = useNavigate();
  
  const temAlertaAtivo = (alertas && alertas.length > 0);

  // Debug logs for ClientCard
  console.log('🎯 ClientCard render:', {
    clientId: client.id,
    clientName: client.nome_completo,
    instagramProfile: client.instagram_prefeitura,
    hasLatestPost: !!latestPost,
    postLoading,
    postError,
    postData: latestPost ? {
      id: latestPost.id,
      hasPublicLink: !!latestPost.link_publico_imagem,
      publicImageUrl: latestPost.link_publico_imagem,
      imageUrl: latestPost.image_url,
      description: latestPost.description?.substring(0, 30) + '...',
      likes: latestPost.likes_count,
      comments: latestPost.comments_count
    } : null
  });

  const handleGerarAnalise = () => {
    navigate(`/gestao-clientes/${client.id}`);
  };

  const formatLastActivity = (lastActivity: string | null) => {
    if (!lastActivity) return null;
    try {
      return format(new Date(lastActivity), "dd/MM/yyyy - HH:mm", { locale: ptBR });
    } catch {
      return null;
    }
  };

  return (
    <Card 
      className="bg-transparent transition-all duration-300 cursor-pointer w-80 h-[620px] border-none"
      onClick={onClick}
    >
      {/* Header com nome da prefeitura e esfera de status */}
      <CardHeader className="pb-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            temAlertaAtivo ? 'bg-red-500 animate-pulse' : 'bg-green-500'
          }`} />
          <CardTitle className="text-white text-lg font-bold">
            {client.nome_completo}
          </CardTitle>
        </div>
        {metrics.lastActivity && (
          <p className="text-blue-300 text-xs mt-1">
            Última análise: {formatLastActivity(metrics.lastActivity)}
          </p>
        )}
      </CardHeader>

      {/* Botão de Alerta de Crise */}
      {temAlertaAtivo && (
        <div className="px-4 pb-2">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAlertIndex(0);
              setShowAlertModal(true);
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
            size="sm"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Criar Ação ({alertas?.length})
          </Button>
        </div>
      )}

      <CardContent className="space-y-3 pb-4 flex flex-col">
        {/* Gráfico de Análise de Sentimento com dados reais */}
        <div className="bg-blue-600 rounded-lg p-3 h-56">
          <h4 className="text-white text-sm font-semibold mb-2 text-center">
            Análise de Sentimento
          </h4>
          <div className="h-44">
      <SentimentAnalysis 
        clientId={client.id}
        compact={true}
      />
          </div>
        </div>

        {/* Última Postagem do Instagram */}
        <div className="bg-blue-600 rounded-lg p-3 flex-shrink-0">
          <div className="flex items-center space-x-2 mb-2">
            <Instagram className="w-4 h-4 text-pink-400" />
            <h4 className="text-white text-sm font-semibold">
              Última Postagem
            </h4>
          </div>
          
          <div className="bg-blue-700 rounded-lg p-2">
            {postLoading ? (
              <div className="space-y-2">
                <div className="w-full h-32 bg-blue-600 rounded animate-pulse"></div>
                <div className="h-4 bg-blue-600 rounded animate-pulse"></div>
                <div className="flex justify-between">
                  <div className="h-3 w-12 bg-blue-600 rounded animate-pulse"></div>
                  <div className="h-3 w-12 bg-blue-600 rounded animate-pulse"></div>
                </div>
              </div>
            ) : postError ? (
              <div className="text-center py-4">
                <p className="text-blue-300 text-xs">Erro ao carregar postagem</p>
              </div>
            ) : latestPost ? (
              <>
                {/* Imagem usando link público */}
                {(latestPost.link_publico_imagem || latestPost.image_url) ? (
                  <img 
                    src={latestPost.link_publico_imagem || latestPost.image_url}
                    alt={`Post do Instagram de ${client.nome_completo}`}
                    className="w-full h-32 object-cover rounded mb-2"
                    onLoad={() => {
                      console.log('✅ Imagem carregada com sucesso');
                    }}
                    onError={() => {
                      console.error('❌ Erro ao carregar imagem');
                    }}
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-blue-600 to-blue-700 rounded mb-2 flex items-center justify-center">
                    <div className="text-center">
                      <Instagram className="w-8 h-8 text-blue-300 mx-auto mb-1" />
                      <p className="text-blue-200 text-xs">Sem imagem disponível</p>
                    </div>
                  </div>
                )}
                
                <p className="text-blue-200 text-xs mb-2 line-clamp-2">
                  {latestPost.description || "Sem descrição disponível"}
                </p>
                <div className="flex justify-between text-xs text-blue-300">
                  <span>❤️ {latestPost.likes_count || 0}</span>
                  <span>💬 {latestPost.comments_count || 0}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-blue-300 text-xs">Nenhuma postagem encontrada</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Modal de Alerta de Crise */}
      <AlertaCriseModal 
        open={showAlertModal}
        onOpenChange={setShowAlertModal}
        alerta={alertas?.[selectedAlertIndex] || null}
      />
    </Card>
  );
};
