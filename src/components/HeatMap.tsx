
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const HeatMap = () => {
  const regions = [
    { name: 'Centro', intensity: 85, interactions: 1247 },
    { name: 'Zona Norte', intensity: 65, interactions: 892 },
    { name: 'Zona Sul', intensity: 72, interactions: 1034 },
    { name: 'Zona Leste', intensity: 58, interactions: 756 },
    { name: 'Zona Oeste', intensity: 79, interactions: 1156 }
  ];

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 80) return 'bg-red-500';
    if (intensity >= 60) return 'bg-orange-500';
    if (intensity >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          🗺️ Mapa de Calor por Região
        </CardTitle>
        <p className="text-sm text-blue-300">Volume de interações por área</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {regions.map((region) => (
            <div key={region.name} className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{region.name}</span>
                  <span className="text-xs text-blue-300">{region.interactions} interações</span>
                </div>
                <div className="w-full bg-blue-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getIntensityColor(region.intensity)} transition-all duration-1000`}
                    style={{ width: `${region.intensity}%` }}
                  />
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${getIntensityColor(region.intensity)}`} />
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-blue-600">
          <div className="flex items-center justify-between text-xs text-blue-300">
            <span>Baixo</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <div className="w-3 h-3 bg-red-500 rounded-full" />
            </div>
            <span>Alto</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
