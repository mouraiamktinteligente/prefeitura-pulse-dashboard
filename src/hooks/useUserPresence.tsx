import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserPresence {
  user_email: string;
  is_online: boolean;
  last_seen: string;
  current_page?: string;
}

export const useUserPresence = (userEmail?: string) => {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [currentUserPresence, setCurrentUserPresence] = useState<UserPresence | null>(null);
  const { toast } = useToast();

  const updatePresence = useCallback(async (currentPage?: string) => {
    if (!userEmail) return;

    const presenceChannel = supabase.channel('user-presence');
    
    const userStatus = {
      user_email: userEmail,
      is_online: true,
      last_seen: new Date().toISOString(),
      current_page: currentPage || window.location.pathname
    };

    await presenceChannel.track(userStatus);
    setCurrentUserPresence(userStatus);
  }, [userEmail]);

  const setupPresenceListener = useCallback(() => {
    if (!userEmail) return;

    const presenceChannel = supabase.channel('user-presence');

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        const users: UserPresence[] = [];
        
        Object.keys(newState).forEach(key => {
          const presences = newState[key] as any[];
          presences.forEach(presence => {
            users.push({
              user_email: presence.user_email,
              is_online: presence.is_online,
              last_seen: presence.last_seen,
              current_page: presence.current_page
            });
          });
        });
        
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const joinedUsers = newPresences.map((p: any) => p.user_email).join(', ');
        if (joinedUsers !== userEmail) {
          toast({
            title: "👋 Usuário conectou",
            description: `${joinedUsers} entrou na plataforma`,
          });
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const leftUsers = leftPresences.map((p: any) => p.user_email).join(', ');
        if (leftUsers !== userEmail) {
          toast({
            title: "👋 Usuário desconectou", 
            description: `${leftUsers} saiu da plataforma`
          });
        }
      })
      .subscribe(async (status) => {
        try {
          if (status === 'SUBSCRIBED') {
            await updatePresence();
            console.log('Presença configurada com sucesso');
          } else {
            console.warn('Falha na configuração de presença:', status);
          }
        } catch (error) {
          console.warn('Erro ao configurar presença:', error);
        }
      });

    return presenceChannel;
  }, [userEmail, updatePresence, toast]);

  const isUserOnline = useCallback((email: string) => {
    return onlineUsers.some(user => user.user_email === email && user.is_online);
  }, [onlineUsers]);

  const getUserCurrentPage = useCallback((email: string) => {
    const user = onlineUsers.find(user => user.user_email === email);
    return user?.current_page;
  }, [onlineUsers]);

  const getOnlineUsersCount = useCallback(() => {
    return onlineUsers.filter(user => user.is_online).length;
  }, [onlineUsers]);

  useEffect(() => {
    if (!userEmail) return;

    let channel: any = null;
    let interval: NodeJS.Timeout;
    let cleanup: (() => void) | null = null;
    
    const setupPresenceListeners = async () => {
      try {
        channel = setupPresenceListener();

        // Atualizar presença a cada 30 segundos
        interval = setInterval(() => {
          updatePresence();
        }, 30000);

        // Atualizar presença quando a página muda
        const handleVisibilityChange = () => {
          if (!document.hidden) {
            updatePresence();
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        cleanup = () => {
          clearInterval(interval);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          if (channel) {
            try {
              supabase.removeChannel(channel);
            } catch (error) {
              console.warn('Erro ao remover canal de presença:', error);
            }
          }
        };
      } catch (error) {
        console.warn('Erro ao configurar presença do usuário:', error);
      }
    };

    setupPresenceListeners();

    return () => {
      if (cleanup) cleanup();
    };
  }, [userEmail, setupPresenceListener, updatePresence]);

  return {
    onlineUsers,
    currentUserPresence,
    isUserOnline,
    getUserCurrentPage,
    getOnlineUsersCount,
    updatePresence
  };
};