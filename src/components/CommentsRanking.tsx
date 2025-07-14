import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

  const CommentCell = ({ comment, isPositive, index }: { comment: any, isPositive: boolean, index: number }) => (
    <div className={`border ${isPositive ? 'border-green-500 bg-blue-600' : 'border-red-500 bg-blue-600'} rounded-lg p-3`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className={`${isPositive ? 'bg-green-600' : 'bg-red-600'} text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center`}>
            {index + 1}
          </span>
          <span className="font-medium text-white text-sm">{comment.user}</span>
          <span className="text-xs text-blue-300 bg-blue-700 px-2 py-1 rounded">{comment.platform}</span>
        </div>
        <Button size="sm" variant="outline" className="h-6 px-1 border-blue-500 text-blue-300 hover:bg-blue-500 text-xs">
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
      <p className="text-xs text-blue-300 mb-2 italic line-clamp-3">"{comment.comment}"</p>
      <div className="flex items-center justify-between">
        <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'} font-medium`}>
          {comment.engagement} interações
        </span>
        {isPositive ? 
          <ThumbsUp className="h-3 w-3 text-green-400" /> : 
          <ThumbsDown className="h-3 w-3 text-red-400" />
        }
      </div>
    </div>
  );

  return (
    <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          🏆 Ranking de Comentários
          <span className="text-red-500 text-sm font-medium">Em desenvolvimento</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-blue-600 hover:bg-transparent">
                <TableHead className="text-red-400 font-semibold text-center border-r border-blue-600 w-1/2">
                  <div className="flex items-center justify-center space-x-2">
                    <ThumbsDown className="h-4 w-4" />
                    <span>Flop Comentários</span>
                  </div>
                </TableHead>
                <TableHead className="text-green-400 font-semibold text-center w-1/2">
                  <div className="flex items-center justify-center space-x-2">
                    <ThumbsUp className="h-4 w-4" />
                    <span>Top Comentários</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[0, 1, 2].map((index) => (
                <TableRow key={index} className="border-blue-600 hover:bg-transparent">
                  <TableCell className="border-r border-blue-600 p-3 align-top">
                    {flopComments[index] && (
                      <CommentCell 
                        comment={flopComments[index]} 
                        isPositive={false} 
                        index={index}
                      />
                    )}
                  </TableCell>
                  <TableCell className="p-3 align-top">
                    {topComments[index] && (
                      <CommentCell 
                        comment={topComments[index]} 
                        isPositive={true} 
                        index={index}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
