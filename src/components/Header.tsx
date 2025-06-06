
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  isConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isConnected }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'medium'
    }).format(date);
  };

  return (
    <header className="bg-dashboard-card border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-dashboard-orange rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-dashboard-card">🏛️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Prefeitura de São Paulo
              </h1>
              <p className="text-muted-foreground text-sm">Dashboard de Engajamento Social</p>
            </div>
          </div>

          {/* Date/Time and Status */}
          <div className="text-right space-y-2">
            <div className="text-sm text-muted-foreground">
              {formatDateTime(currentTime)}
            </div>
            <Badge 
              variant={isConnected ? "default" : "destructive"}
              className={`${isConnected ? 'bg-dashboard-green' : 'bg-dashboard-red'} text-dashboard-card border-0`}
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-dashboard-card' : 'bg-dashboard-card'} animate-pulse`} />
              {isConnected ? 'Sistema Online' : 'Desconectado'}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
};
