
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { getClientIcon } from '@/utils/clientIconUtils';

interface HeaderProps {
  isConnected: boolean;
  clientName?: string;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, clientName }) => {
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

  const IconComponent = clientName ? getClientIcon(clientName) : Building2;

  return (
    <header className="bg-blue-800 text-white shadow-2xl border-b border-blue-600 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center shadow-lg">
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
                {clientName || 'Dashboard'}
              </h1>
            </div>
          </div>

          {/* Date/Time and Status */}
          <div className="text-right space-y-2">
            <div className="text-sm text-blue-300">
              {formatDateTime(currentTime)}
            </div>
            <Badge 
              variant={isConnected ? "default" : "destructive"}
              className={`${isConnected ? 'bg-green-600' : 'bg-red-600'} text-white border-0`}
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
              {isConnected ? 'Sistema Online' : 'Desconectado'}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
};
