
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
    if (value >= 70) return 'text-green-400';
    if (value >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          🌡️ Termômetro de Satisfação
        </CardTitle>
        <p className="text-sm text-blue-300">Baseado nas últimas 24h</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* Thermometer Visual */}
          <div className="relative w-8 h-48 bg-blue-600 rounded-full overflow-hidden border border-blue-500">
            <div 
              className={`absolute bottom-0 w-full transition-all duration-1000 ${getColor(satisfaction)}`}
              style={{ height: `${satisfaction}%` }}
            />
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full border border-blue-400" />
          </div>

          {/* Satisfaction Score */}
          <div className="text-center">
            <div className={`text-3xl font-bold ${getTextColor(satisfaction)}`}>
              {satisfaction}%
            </div>
            <p className="text-sm text-blue-300">Satisfação Popular</p>
          </div>

          {/* Trend Indicator */}
          <div className="flex items-center space-x-2 text-green-400">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">+{trend}% vs ontem</span>
          </div>

          {/* Scale */}
          <div className="w-full flex justify-between text-xs text-blue-300 mt-4">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
