
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const CrisisTimeline = () => {
  const data = [
    { day: '01/06', negative: 12, events: 'Normal' },
    { day: '02/06', negative: 15, events: 'Normal' },
    { day: '03/06', negative: 45, events: 'Protesto trânsito' },
    { day: '04/06', negative: 28, events: 'Repercussão' },
    { day: '05/06', negative: 18, events: 'Estabilizando' },
    { day: '06/06', negative: 14, events: 'Normal' }
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
          📉 Linha do Tempo de Crise
        </CardTitle>
        <p className="text-sm text-slate-600">Picos de comentários negativos</p>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }}
                labelFormatter={(value) => `Data: ${value}`}
                formatter={(value, name) => [
                  `${value} comentários negativos`,
                  'Comentários Negativos'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="negative" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Event Markers */}
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-semibold text-slate-700">Eventos Detectados:</h4>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-xs text-slate-600">03/06 - Protesto sobre trânsito (pico: 45 comentários)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span className="text-xs text-slate-600">04/06 - Repercussão nas redes sociais</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
