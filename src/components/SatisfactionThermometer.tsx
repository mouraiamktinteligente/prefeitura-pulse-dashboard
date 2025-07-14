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
        <div className="flex flex-col items-center space-y-6">
          {/* Circular Thermometer */}
          <div className="relative w-56 h-32 overflow-hidden">
            {/* Background Arc */}
            <div className="absolute inset-0">
              <svg width="224" height="128" viewBox="0 0 224 128" className="transform">
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
                  d="M 24 104 A 88 88 0 0 1 200 104"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                
                {/* Colored arc */}
                <path
                  d="M 24 104 A 88 88 0 0 1 200 104"
                  fill="none"
                  stroke="url(#thermometerGradient)"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray="276.5"
                  strokeDashoffset={276.5 - (satisfaction / 100) * 276.5}
                  className="transition-all duration-1000"
                />
                
                {/* Needle */}
                <g transform={`translate(112, 104) rotate(${angle - 90})`}>
                  <line
                    x1="0"
                    y1="0"
                    x2="70"
                    y2="0"
                    stroke="#1f2937"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="0" cy="0" r="6" fill="#1f2937" />
                </g>
              </svg>
            </div>

            {/* Center Value */}
            <div className="absolute inset-0 flex items-end justify-center pb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">
                  {satisfaction}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Progress Bar */}
          <div className="w-40 h-3 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-1000"
              style={{ width: `${satisfaction}%` }}
            />
          </div>

          {/* Satisfaction Label */}
          <div className="text-center">
            <p className="text-sm text-blue-300">Satisfação Popular</p>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};
