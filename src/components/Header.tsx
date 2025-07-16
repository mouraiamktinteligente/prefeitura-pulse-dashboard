
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
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

          {/* Date/Time */}
          <div className="text-right">
            <div className="text-sm text-blue-300">
              {formatDateTime(currentTime)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
