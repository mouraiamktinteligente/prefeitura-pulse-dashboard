
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export const SentimentAnalysis = () => {
  const data = [
    { name: 'Positivo', value: 65, color: '#10b981' },
    { name: 'Neutro', value: 25, color: '#f59e0b' },
    { name: 'Negativo', value: 10, color: '#ef4444' }
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
          📊 Análise de Sentimento
        </CardTitle>
        <p className="text-sm text-slate-600">Instagram + Web (últimas 24h)</p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {data.map((item) => (
            <div key={item.name} className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-1`} style={{ backgroundColor: item.color }} />
              <p className="text-xs text-slate-600">{item.name}</p>
              <p className="text-sm font-semibold">{item.value}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
