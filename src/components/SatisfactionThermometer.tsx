
import React from 'react';
import { TrendingUp } from 'lucide-react';

export const SatisfactionThermometer = () => {
  const satisfaction = 72; // Out of 100
  const trend = +5; // Compared to yesterday

  const getColor = (value: number) => {
    if (value >= 70) return '#10b981';
    if (value >= 40) return '#f59e0b';
    return '#ef4444';
  };

  // Calculate the stroke-dasharray for the circular progress
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (satisfaction / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Title and subtitle outside the card */}
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center">
          🌡️ Termômetro de Satisfação
        </h3>
        <p className="text-sm text-slate-400">Baseado nas últimas 24h</p>
      </div>

      {/* Card with thermometer */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center">
        {/* Circular Thermometer */}
        <div className="relative w-48 h-48 mb-4">
          <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="rgb(51 65 85)"
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
            <div className="text-4xl font-bold text-green-400">
              {satisfaction}
            </div>
            <p className="text-sm text-slate-400 mt-1">Satisfação</p>
          </div>
        </div>
      </div>

      {/* Information outside the card */}
      <div className="space-y-2">
        {/* Trend Indicator */}
        <div className="flex items-center space-x-2 text-green-400">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">+{trend}% vs ontem</span>
        </div>

        {/* Scale */}
        <div className="flex justify-between text-xs text-slate-400">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};
