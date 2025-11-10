import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'login' | 'logout' | 'disconnect';
  email: string;
  timestamp: Date;
  read: boolean;
}

export const AccessNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Listener para novos logins (INSERT)
    const loginChannel = supabase
      .channel('access-notifications-insert')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'logs_acesso'
        },
        (payload) => {
          const newLog = payload.new as any;
          const notification: Notification = {
            id: newLog.id,
            type: 'login',
            email: newLog.email_usuario,
            timestamp: new Date(newLog.data_hora_login),
            read: false
          };

          setNotifications(prev => [notification, ...prev.slice(0, 49)]);
          setUnreadCount(prev => prev + 1);

          toast({
            title: "🟢 Novo Login",
            description: `${newLog.email_usuario} acabou de fazer login`,
            duration: 4000,
          });
        }
      )
      .subscribe();

    // Listener para logouts (UPDATE)
    const logoutChannel = supabase
      .channel('access-notifications-update')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'logs_acesso'
        },
        (payload) => {
          const updatedLog = payload.new as any;
          
          if (updatedLog.data_hora_logout) {
            const notification: Notification = {
              id: `${updatedLog.id}-logout`,
              type: 'logout',
              email: updatedLog.email_usuario,
              timestamp: new Date(updatedLog.data_hora_logout),
              read: false
            };

            setNotifications(prev => [notification, ...prev.slice(0, 49)]);
            setUnreadCount(prev => prev + 1);

            toast({
              title: "🔴 Desconexão",
              description: `${updatedLog.email_usuario} foi desconectado`,
              duration: 4000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(loginChannel);
      supabase.removeChannel(logoutChannel);
    };
  }, [toast]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'login':
        return '🟢';
      case 'logout':
      case 'disconnect':
        return '🔴';
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'login':
        return `fez login`;
      case 'logout':
        return `foi desconectado`;
      case 'disconnect':
        return `foi desconectado pelo administrador`;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d atrás`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-blue-200 hover:text-white hover:bg-blue-700/50"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-blue-800 border-blue-700" align="end">
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Notificações de Acesso</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-blue-300 hover:text-white"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-blue-300">
              Nenhuma notificação recente
            </div>
          ) : (
            <div className="divide-y divide-blue-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-blue-700/30 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-700/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        <span className="font-medium">{notification.email}</span>
                        {' '}
                        <span className="text-blue-300">{getNotificationText(notification)}</span>
                      </p>
                      <p className="text-xs text-blue-400 mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t border-blue-700">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-blue-300 hover:text-white hover:bg-blue-700/50"
            onClick={() => navigate('/admin/access-logs')}
          >
            Ver todos os logs
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
