
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
      comment: 'Quando vão arrumar as ruas do centro?',
      severity: 'baixa',
      timestamp: '4h atrás'
    },
    {
      id: 3,
      user: '@carlos_oliveira',
      platform: 'Instagram',
      comment: 'Imposto alto e serviço ruim!',
      severity: 'alta',
      timestamp: '6h atrás'
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
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
          ⚠️ Alertas de Comentários
        </CardTitle>
        <p className="text-sm text-slate-600">Comentários que exigem atenção</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {maliciousComments.map((comment) => (
            <div key={comment.id} className="border border-slate-200 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-slate-700">{comment.user}</span>
                  <span className="text-xs text-slate-500">{comment.platform}</span>
                </div>
                <Badge className={getSeverityColor(comment.severity)}>
                  {comment.severity}
                </Badge>
              </div>
              
              <p className="text-sm text-slate-600 italic">"{comment.comment}"</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{comment.timestamp}</span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="h-7 px-2">
                    <Users className="h-3 w-3 mr-1" />
                    Equipe
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-2">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Responder
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-2">
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
