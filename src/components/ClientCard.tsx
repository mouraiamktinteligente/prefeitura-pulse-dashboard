
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram } from 'lucide-react';
import type { Cliente } from '@/hooks/useClients';
import { SentimentAnalysis } from './SentimentAnalysis';

interface ClientCardProps {
  client: Cliente;
  onClick: () => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
  // Post simulado do Instagram
  const mockPost = {
    image: "https://picsum.photos/200/200?random=" + client.id,
    caption: "Confira as últimas novidades e projetos em andamento...",
    likes: Math.floor(Math.random() * 500) + 50,
    comments: Math.floor(Math.random() * 100) + 10
  };

  return (
    <Card 
      className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 w-80 h-[600px]"
      onClick={onClick}
    >
      {/* Header com nome da prefeitura */}
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-white text-lg font-bold">
          {client.nome_completo}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Gráfico de Análise de Sentimento com dados reais */}
        <div className="bg-blue-600 rounded-lg p-3">
          <h4 className="text-white text-sm font-semibold mb-2 text-center">
            Análise de Sentimento
          </h4>
          <div className="h-32 -m-3">
            <SentimentAnalysis clientId={client.id} />
          </div>
        </div>

        {/* Última Postagem do Instagram */}
        <div className="bg-blue-600 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Instagram className="w-4 h-4 text-pink-400" />
            <h4 className="text-white text-sm font-semibold">
              Última Postagem
            </h4>
          </div>
          
          <div className="bg-blue-700 rounded-lg p-2">
            <img 
              src={mockPost.image} 
              alt="Post" 
              className="w-full h-32 object-cover rounded mb-2"
            />
            <p className="text-blue-200 text-xs mb-2 line-clamp-2">
              {mockPost.caption}
            </p>
            <div className="flex justify-between text-xs text-blue-300">
              <span>❤️ {mockPost.likes}</span>
              <span>💬 {mockPost.comments}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
