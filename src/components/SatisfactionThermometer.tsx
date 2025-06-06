
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export const SatisfactionThermometer = () => {
  const satisfaction = 72; // Out of 100
  const trend = +5; // Compared to yesterday

  const getColor = (value: number) => {
    if (value >= 70) return '#10b981';
    if (value >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getTextColor = (value: number) => {
    if (value >= 70) return 'text-green-400';
    if (value >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Calculate the stroke-dasharray for the circular progress
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (satisfaction / 100) * circumference;

  return (
    <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 h-96">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          🌡️ Termômetro de Satisfação
        </CardTitle>
        <p className="text-sm text-blue-300">Baseado nas últimas 24h</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-full">
        {/* Circular Thermometer */}
        <div className="relative w-48 h-48 mb-4">
          <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="rgb(30 58 138)"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke={getColor(satisfaction)}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-4xl font-bold ${getTextColor(satisfaction)}`}>
              {satisfaction}
            </div>
            <p className="text-sm text-blue-300 mt-1">Satisfação</p>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center space-x-2 text-green-400 mb-4">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">+{trend}% vs ontem</span>
        </div>

        {/* Scale */}
        <div className="w-full flex justify-between text-xs text-blue-300">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </CardContent>
    </Card>
  );
};
