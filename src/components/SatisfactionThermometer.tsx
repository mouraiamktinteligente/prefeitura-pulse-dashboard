
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export const SatisfactionThermometer = () => {
  const satisfaction = 72; // Out of 100
  const trend = +5; // Compared to yesterday

  const getColor = (value: number) => {
    if (value >= 70) return 'bg-green-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (value: number) => {
    if (value >= 70) return 'text-green-600';
    if (value >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
          🌡️ Termômetro de Satisfação
        </CardTitle>
        <p className="text-sm text-slate-600">Baseado nas últimas 24h</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* Thermometer Visual */}
          <div className="relative w-8 h-48 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`absolute bottom-0 w-full transition-all duration-1000 ${getColor(satisfaction)}`}
              style={{ height: `${satisfaction}%` }}
            />
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-slate-300 rounded-full" />
          </div>

          {/* Satisfaction Score */}
          <div className="text-center">
            <div className={`text-3xl font-bold ${getTextColor(satisfaction)}`}>
              {satisfaction}%
            </div>
            <p className="text-sm text-slate-600">Satisfação Popular</p>
          </div>

          {/* Trend Indicator */}
          <div className="flex items-center space-x-2 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">+{trend}% vs ontem</span>
          </div>

          {/* Scale */}
          <div className="w-full flex justify-between text-xs text-slate-500 mt-4">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
