
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye, MessageSquare, Users } from 'lucide-react';

export const MaliciousComments = () => {
  const maliciousComments = [
    {
      id: 1,
      user: '@joao_silva',
      platform: 'Instagram',
      comment: 'Essa gestão só sabe fazer promessa...',
      severity: 'média',
      timestamp: '2h atrás'
    },
    {
      id: 2,
      user: '@maria_santos',
      platform: 'Web',
      comment: 'Quando vão arrumar as ruas?',
      severity: 'baixa',
      timestamp: '4h atrás'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'média': return 'bg-yellow-100 text-yellow-800';
      case 'baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 h-[480px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          ⚠️ Alertas de Comentários
        </CardTitle>
        <p className="text-sm text-blue-300">Comentários que exigem atenção</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {maliciousComments.map((comment) => (
            <div key={comment.id} className="border border-blue-600 bg-blue-600 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-white">{comment.user}</span>
                  <span className="text-xs text-blue-300">{comment.platform}</span>
                </div>
                <Badge className={getSeverityColor(comment.severity)}>
                  {comment.severity}
                </Badge>
              </div>
              
              <p className="text-sm text-blue-300 italic">"{comment.comment}"</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-300">{comment.timestamp}</span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="h-7 px-2 border-blue-500 text-blue-300 hover:bg-blue-500">
                    <Users className="h-3 w-3 mr-1" />
                    Equipe
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-2 border-blue-500 text-blue-300 hover:bg-blue-500">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Responder
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-2 border-blue-500 text-blue-300 hover:bg-blue-500">
                    <Eye className="h-3 w-3 mr-1" />
                    Ocultar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
