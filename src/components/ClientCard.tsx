
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import type { Cliente } from '@/hooks/useClients';
import { SentimentAnalysis } from './SentimentAnalysis';
import { useClientMetrics } from '@/hooks/useClientMetrics';
import { useInstagramPosts } from '@/hooks/useInstagramPosts';

interface ClientCardProps {
  client: Cliente;
  onClick: () => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
  const { metrics } = useClientMetrics(client.instagram_prefeitura || undefined);
  const { latestPost, loading: postLoading, error: postError } = useInstagramPosts(client.instagram_prefeitura || undefined);
  const navigate = useNavigate();

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
      className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 w-80 h-[650px]"
      onClick={onClick}
    >
      {/* Header com nome da prefeitura */}
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-white text-lg font-bold">
          {client.nome_completo}
        </CardTitle>
        {metrics.lastActivity && (
          <p className="text-blue-300 text-xs mt-1">
            Última análise: {formatLastActivity(metrics.lastActivity)}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4 h-full pb-4 flex flex-col">
        {/* Gráfico de Análise de Sentimento com dados reais */}
        <div className="bg-blue-600 rounded-lg p-3 h-52">
          <h4 className="text-white text-sm font-semibold mb-2 text-center">
            Análise de Sentimento
          </h4>
          <div className="h-40">
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
                <img 
                  src={latestPost.image_url || "https://picsum.photos/200/200?random=" + client.id} 
                  alt="Post" 
                  className="w-full h-32 object-cover rounded mb-2"
                  onError={(e) => {
                    e.currentTarget.src = "https://picsum.photos/200/200?random=" + client.id;
                  }}
                />
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
    </Card>
  );
};
