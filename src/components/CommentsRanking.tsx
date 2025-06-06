
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';

export const CommentsRanking = () => {
  const topComments = [
    {
      id: 1,
      user: '@ana_rodrigues',
      platform: 'Instagram',
      comment: 'Parabéns pela reforma da praça! Ficou linda e as crianças adoraram o novo playground.',
      engagement: 245,
      type: 'positive'
    },
    {
      id: 2,
      user: '@pedro_costa',
      platform: 'Web',
      comment: 'Excelente iniciativa com a ciclovia. Agora posso ir trabalhar de bike com segurança!',
      engagement: 189,
      type: 'positive'
    },
    {
      id: 3,
      user: '@lucia_ferreira',
      platform: 'Instagram',
      comment: 'A nova iluminação da avenida principal fez toda a diferença. Obrigada!',
      engagement: 156,
      type: 'positive'
    }
  ];

  const flopComments = [
    {
      id: 1,
      user: '@marcos_silva',
      platform: 'Web',
      comment: 'Há 3 meses pedindo o conserto do buraco na minha rua e nada! Absurdo!',
      engagement: 98,
      type: 'negative'
    },
    {
      id: 2,
      user: '@carla_santos',
      platform: 'Instagram',
      comment: 'Transporte público sucateado. Quando vão melhorar isso?',
      engagement: 87,
      type: 'negative'
    },
    {
      id: 3,
      user: '@rafael_lima',
      platform: 'Web',
      comment: 'Impostos altos e contrapartida baixa. Precisa rever as prioridades!',
      engagement: 76,
      type: 'negative'
    }
  ];

  return (
    <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          🏆 Ranking de Comentários
        </CardTitle>
        <p className="text-sm text-blue-300">Melhores e piores interações</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="top" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-blue-600">
            <TabsTrigger value="top" className="flex items-center space-x-2 data-[state=active]:bg-blue-500 text-white">
              <ThumbsUp className="h-4 w-4" />
              <span>Top Comentários</span>
            </TabsTrigger>
            <TabsTrigger value="flop" className="flex items-center space-x-2 data-[state=active]:bg-blue-500 text-white">
              <ThumbsDown className="h-4 w-4" />
              <span>Flop Comentários</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="top" className="space-y-4 mt-4">
            {topComments.map((comment, index) => (
              <div key={comment.id} className="border border-green-500 bg-blue-600 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-medium text-white">{comment.user}</span>
                    <span className="text-xs text-blue-300 bg-blue-700 px-2 py-1 rounded">{comment.platform}</span>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 px-2 border-blue-500 text-blue-300 hover:bg-blue-500">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ver Perfil
                  </Button>
                </div>
                <p className="text-sm text-blue-300 mb-3 italic">"{comment.comment}"</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-400 font-medium">
                    {comment.engagement} interações
                  </span>
                  <ThumbsUp className="h-4 w-4 text-green-400" />
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="flop" className="space-y-4 mt-4">
            {flopComments.map((comment, index) => (
              <div key={comment.id} className="border border-red-500 bg-blue-600 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-medium text-white">{comment.user}</span>
                    <span className="text-xs text-blue-300 bg-blue-700 px-2 py-1 rounded">{comment.platform}</span>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 px-2 border-blue-500 text-blue-300 hover:bg-blue-500">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ver Perfil
                  </Button>
                </div>
                <p className="text-sm text-blue-300 mb-3 italic">"{comment.comment}"</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-red-400 font-medium">
                    {comment.engagement} interações
                  </span>
                  <ThumbsDown className="h-4 w-4 text-red-400" />
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
