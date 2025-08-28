import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SecurityAlert {
  type: 'multiple_sessions' | 'suspicious_ip' | 'failed_login' | 'admin_disconnect';
  message: string;
  timestamp: string;
  details: any;
}

interface SessionInfo {
  user_email: string;
  ip_address: string;
  last_activity: string;
  expires_at: string;
  created_at: string;
}

export const useSecurityMonitoring = () => {
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { toast } = useToast();

  const fetchActiveSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sessoes_ativas')
        .select(`
          user_email,
          ip_address,
          last_activity,
          expires_at,
          created_at
        `)
        .eq('ativo', true)
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('Erro ao buscar sessões ativas:', error);
        return;
      }

      setActiveSessions(data || []);
    } catch (error) {
      console.error('Erro ao buscar sessões ativas:', error);
    }
  }, []);

  const checkForSecurityThreats = useCallback(async () => {
    try {
      // Verificar IPs com múltiplas sessões
      const ipGroups = activeSessions.reduce((acc, session) => {
        if (!session.ip_address) return acc;
        
        if (!acc[session.ip_address]) {
          acc[session.ip_address] = [];
        }
        acc[session.ip_address].push(session);
        return acc;
      }, {} as { [key: string]: SessionInfo[] });

      const newAlerts: SecurityAlert[] = [];

      // Alertas para múltiplas sessões no mesmo IP
      Object.entries(ipGroups).forEach(([ip, sessions]) => {
        if (sessions.length > 1) {
          const userEmails = sessions.map(s => s.user_email).join(', ');
          newAlerts.push({
            type: 'multiple_sessions',
            message: `Múltiplas sessões detectadas no IP ${ip}`,
            timestamp: new Date().toISOString(),
            details: { ip, users: userEmails, count: sessions.length }
          });
        }
      });

      // Verificar sessões muito antigas (mais de 4 horas sem atividade)
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
      activeSessions.forEach(session => {
        const lastActivity = new Date(session.last_activity);
        if (lastActivity < fourHoursAgo) {
          newAlerts.push({
            type: 'suspicious_ip',
            message: `Sessão inativa há mais de 4 horas: ${session.user_email}`,
            timestamp: new Date().toISOString(),
            details: { user: session.user_email, lastActivity: session.last_activity }
          });
        }
      });

      setSecurityAlerts(newAlerts);

      // Mostrar toast para alertas críticos
      const criticalAlerts = newAlerts.filter(alert => 
        alert.type === 'multiple_sessions' && alert.details.count > 2
      );

      criticalAlerts.forEach(alert => {
        toast({
          title: "Alerta de Segurança",
          description: alert.message,
          variant: "destructive"
        });
      });

    } catch (error) {
      console.error('Erro ao verificar ameaças de segurança:', error);
    }
  }, [activeSessions, toast]);

  const forceDisconnectSession = useCallback(async (userEmail: string, adminEmail: string) => {
    try {
      // Invalidar sessão específica
      const { error } = await supabase
        .from('sessoes_ativas')
        .update({ ativo: false })
        .eq('user_email', userEmail)
        .eq('ativo', true);

      if (error) {
        throw error;
      }

      // Marcar usuário como desconectado
      await supabase
        .from('usuarios_sistema')
        .update({ status_conexao: 'desconectado' })
        .eq('email', userEmail);

      // Enviar comando de desconexão via realtime
      const channel = supabase.channel(`security-disconnect-${userEmail}`);
      await channel.send({
        type: 'broadcast',
        event: 'force_logout',
        payload: {
          targetEmail: userEmail,
          reason: 'Desconectado por motivos de segurança',
          adminEmail,
          timestamp: new Date().toISOString(),
          security: true
        }
      });

      setTimeout(() => supabase.removeChannel(channel), 2000);

      // Registrar alerta de segurança
      setSecurityAlerts(prev => [...prev, {
        type: 'admin_disconnect',
        message: `Usuário ${userEmail} desconectado por ${adminEmail} (segurança)`,
        timestamp: new Date().toISOString(),
        details: { user: userEmail, admin: adminEmail }
      }]);

      toast({
        title: "Sucesso",
        description: `Usuário ${userEmail} foi desconectado por motivos de segurança.`
      });

      // Atualizar lista de sessões
      await fetchActiveSessions();

      return true;
    } catch (error) {
      console.error('Erro ao desconectar sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desconectar a sessão.",
        variant: "destructive"
      });
      return false;
    }
  }, [fetchActiveSessions, toast]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    fetchActiveSessions();
  }, [fetchActiveSessions]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Atualizar sessões ativas a cada 30 segundos quando monitorando
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(fetchActiveSessions, 30000);
    return () => clearInterval(interval);
  }, [isMonitoring, fetchActiveSessions]);

  // Verificar ameaças quando as sessões mudam
  useEffect(() => {
    if (activeSessions.length > 0) {
      checkForSecurityThreats();
    }
  }, [activeSessions, checkForSecurityThreats]);

  // Listener para mudanças em tempo real
  useEffect(() => {
    let channel: any = null;

    const setupRealtimeListener = async () => {
      try {
        channel = supabase
          .channel('security-monitoring')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'sessoes_ativas'
          }, () => {
            if (isMonitoring) {
              fetchActiveSessions();
            }
          });

        await channel.subscribe();
        console.log('Listener de segurança configurado com sucesso');
      } catch (error) {
        console.warn('Erro ao configurar listener de segurança:', error);
        // Continue without realtime - the app should work without it
      }
    };

    setupRealtimeListener();

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.warn('Erro ao remover canal de segurança:', error);
        }
      }
    };
  }, [isMonitoring, fetchActiveSessions]);

  return {
    activeSessions,
    securityAlerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    forceDisconnectSession,
    fetchActiveSessions
  };
};