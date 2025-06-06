
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SatisfactionThermometer = () => {
  const satisfaction = 73; // Out of 100
  
  // Calculate colors for the circular progress
  const getProgressColor = (value: number) => {
    if (value >= 70) return '#4ECDC4'; // Teal
    if (value >= 50) return '#FFA726'; // Orange
    if (value >= 30) return '#FF6B6B'; // Red
    return '#FF6B6B';
  };

  const strokeColor = getProgressColor(satisfaction);
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (satisfaction / 100) * circumference;

  return (
    <Card className="bg-dashboard-card border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground text-center">
          Satisfação dos Cidadãos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-6">
          {/* Circular Progress */}
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="hsl(var(--border))"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={strokeColor}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000"
              />
            </svg>
            {/* Center value */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{satisfaction}</span>
            </div>
          </div>

          {/* Progress bar at bottom */}
          <div className="w-full max-w-[200px]">
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-1000 rounded-full"
                style={{ 
                  width: `${satisfaction}%`,
                  background: `linear-gradient(90deg, #FF6B6B 0%, #FFA726 50%, #4ECDC4 100%)`
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
