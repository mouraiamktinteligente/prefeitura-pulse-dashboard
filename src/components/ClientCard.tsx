
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Instagram } from 'lucide-react';
import type { Cliente } from '@/hooks/useClients';

interface ClientCardProps {
  client: Cliente;
  onClick: () => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
  // Dados simulados de sentimento para cada cliente
  const sentimentData = [
    { name: 'Positivo', value: Math.floor(Math.random() * 40) + 40, color: '#10b981' },
    { name: 'Neutro', value: Math.floor(Math.random() * 30) + 20, color: '#f59e0b' },
    { name: 'Negativo', value: Math.floor(Math.random() * 20) + 5, color: '#ef4444' }
  ];

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
        <p className="text-blue-300 text-sm">Prefeitura Municipal</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Gráfico de Análise de Sentimento */}
        <div className="bg-blue-600 rounded-lg p-3">
          <h4 className="text-white text-sm font-semibold mb-2 text-center">
            Análise de Sentimento
          </h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  dataKey="value"
                  label={false}
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-2">
            {sentimentData.map((item) => (
              <div key={item.name} className="text-center">
                <div 
                  className="w-2 h-2 rounded-full mx-auto mb-1" 
                  style={{ backgroundColor: item.color }} 
                />
                <p className="text-xs text-blue-300">{item.value}%</p>
              </div>
            ))}
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

        {/* Indicador de clique */}
        <div className="text-center">
          <p className="text-blue-300 text-xs">
            Clique para ver detalhes completos
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
