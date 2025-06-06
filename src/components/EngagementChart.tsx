
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const EngagementChart = () => {
  const data = [
    { day: 'Seg', posts: 12, engagement: 4500 },
    { day: 'Ter', posts: 8, engagement: 3200 },
    { day: 'Qua', posts: 15, engagement: 6800 },
    { day: 'Qui', posts: 10, engagement: 4100 },
    { day: 'Sex', posts: 18, engagement: 8900 },
    { day: 'Sáb', posts: 6, engagement: 2800 },
    { day: 'Dom', posts: 4, engagement: 1900 }
  ];

  const topPost = {
    type: 'Anúncio de Obra',
    date: '2024-06-05',
    engagement: 8900,
    link: '#'
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
          📈 Postagens e Engajamento
        </CardTitle>
        <p className="text-sm text-slate-600">Últimos 7 dias</p>
      </CardHeader>
      <CardContent>
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Bar dataKey="posts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Post */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
          <h4 className="font-semibold text-slate-800 mb-2">🏆 Post com Maior Engajamento</h4>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700">{topPost.type}</p>
            <p className="text-xs text-slate-600">{topPost.date}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-orange-600">{topPost.engagement.toLocaleString()} interações</span>
              <button className="text-xs text-blue-600 hover:underline">Ver Post</button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
