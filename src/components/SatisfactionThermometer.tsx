import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export const SatisfactionThermometer = () => {
  const satisfaction = 73; // Out of 100
  const trend = +5; // Compared to yesterday

  // Calculate the rotation angle for the needle (0-180 degrees)
  const angle = (satisfaction / 100) * 180;

  return (
    <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 h-[480px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          📊 Análise Pesquisa Qualitativa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-full space-y-8 pt-4">
          {/* Circular Thermometer */}
          <div className="relative w-80 h-48 overflow-hidden">
            {/* Background Arc */}
            <div className="absolute inset-0">
              <svg width="320" height="192" viewBox="0 0 320 192" className="transform">
                {/* Gradient Definitions */}
                <defs>
                  <linearGradient id="thermometerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="25%" stopColor="#f97316" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="75%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                
                {/* Background arc */}
                <path
                  d="M 32 156 A 128 128 0 0 1 288 156"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                
                {/* Colored arc */}
                <path
                  d="M 32 156 A 128 128 0 0 1 288 156"
                  fill="none"
                  stroke="url(#thermometerGradient)"
                  strokeWidth="24"
                  strokeLinecap="round"
                  strokeDasharray="402.1"
                  strokeDashoffset={402.1 - (satisfaction / 100) * 402.1}
                  className="transition-all duration-1000"
                />
                
                {/* Needle */}
                <g transform={`translate(160, 156) rotate(${angle - 90})`}>
                  <line
                    x1="0"
                    y1="0"
                    x2="100"
                    y2="0"
                    stroke="#1f2937"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <circle cx="0" cy="0" r="8" fill="#1f2937" />
                </g>
              </svg>
            </div>

            {/* Center Value */}
            <div className="absolute inset-0 flex items-end justify-center pb-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-white">
                  {satisfaction}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Progress Bar */}
          <div className="w-56 h-4 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-1000"
              style={{ width: `${satisfaction}%` }}
            />
          </div>

          {/* Satisfaction Label */}
          <div className="text-center">
            <p className="text-base text-blue-300">Satisfação Popular</p>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};
