import React from 'react';
import { Wifi, WifiOff, Users, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useAuth } from '@/contexts/auth';

interface RealtimeIndicatorProps {
  showOnlineUsers?: boolean;
  className?: string;
}

export const RealtimeIndicator: React.FC<RealtimeIndicatorProps> = ({ 
  showOnlineUsers = false, 
  className = "" 
}) => {
  const { user } = useAuth();
  const { onlineUsers, getOnlineUsersCount } = useUserPresence(user?.email);

  const isConnected = true; // Para simplificar, consideramos sempre conectado

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Indicador de conexão */}
      <div className="flex items-center gap-1">
        {isConnected ? (
          <div className="flex items-center gap-1 text-green-400">
            <Wifi className="w-4 h-4" />
            <Activity className="w-3 h-3 animate-pulse" />
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-400">
            <WifiOff className="w-4 h-4" />
            <span className="text-xs">Offline</span>
          </div>
        )}
      </div>

      {/* Contador de usuários online */}
      {showOnlineUsers && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span className="text-xs">{getOnlineUsersCount()} online</span>
        </Badge>
      )}

      {/* Indicador de tempo real */}
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-muted-foreground">Tempo real</span>
      </div>
    </div>
  );
};