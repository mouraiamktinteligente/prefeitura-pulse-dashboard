import { useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface UseBrowserEventsProps {
  userEmail: string | null;
  onLogout: (reason?: string) => Promise<void>;
}

export const useBrowserEvents = ({ userEmail, onLogout }: UseBrowserEventsProps) => {
  const isLoggingOutRef = useRef(false);
  const heartbeatRef = useRef<NodeJS.Timeout>();

  // Função para fazer logout via beacon (mais confiável)
  const browserClosedLogout = async (email: string) => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      // Usar sendBeacon para garantir que a requisição seja enviada mesmo com o navegador fechando
      const logoutData = {
        user_email: email,
        motivo: 'browser_closed',
        timestamp: new Date().toISOString()
      };

      // Tentar sendBeacon primeiro (mais confiável)
      const beaconSupported = 'sendBeacon' in navigator;
      if (beaconSupported) {
        const success = navigator.sendBeacon(
          `${supabase.supabaseUrl}/rest/v1/rpc/force_logout_user`,
          JSON.stringify(logoutData)
        );
        console.log('Beacon logout enviado:', success);
      }

      // Fallback com fetch keepalive
      if (!beaconSupported) {
        await fetch(`${supabase.supabaseUrl}/rest/v1/rpc/force_logout_user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`
          },
          body: JSON.stringify(logoutData),
          keepalive: true
        });
      }

      // Marcar no sessionStorage que o logout foi feito
      sessionStorage.setItem('browser_logout_done', 'true');
      
    } catch (error) {
      console.error('Erro no logout do navegador:', error);
    }
  };

  // Detectar fechamento do navegador
  useEffect(() => {
    if (!userEmail) return;

    // Marcar que a sessão está ativa no sessionStorage
    sessionStorage.setItem('session_active', 'true');
    sessionStorage.setItem('user_email', userEmail);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Fazer logout imediato via beacon
      browserClosedLogout(userEmail);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Página está sendo escondida (pode ser fechamento)
        browserClosedLogout(userEmail);
      }
    };

    const handlePageHide = () => {
      // Página está sendo escondida/fechada
      browserClosedLogout(userEmail);
    };

    const handleUnload = () => {
      // Último recurso - navegador fechando
      browserClosedLogout(userEmail);
    };

    // Adicionar todos os listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('unload', handleUnload);

    return () => {
      // Limpar listeners
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('unload', handleUnload);
    };
  }, [userEmail]);

  // Heartbeat melhorado (30 segundos)
  useEffect(() => {
    if (!userEmail) return;

    const startHeartbeat = () => {
      heartbeatRef.current = setInterval(async () => {
        try {
          const sessionToken = localStorage.getItem('session_token');
          if (!sessionToken) {
            console.log('Sem token de sessão, parando heartbeat');
            return;
          }

          // Enviar heartbeat
          const { error } = await supabase
            .from('sessoes_ativas')
            .update({ 
              last_activity: new Date().toISOString(),
              expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
            })
            .eq('user_email', userEmail.trim().toLowerCase())
            .eq('session_token', sessionToken)
            .eq('ativo', true);

          if (error) {
            console.log('Heartbeat falhou, fazendo logout:', error);
            await onLogout('Sua sessão expirou');
          }
        } catch (error) {
          console.error('Erro no heartbeat:', error);
          await onLogout('Erro na validação da sessão');
        }
      }, 30000); // 30 segundos
    };

    startHeartbeat();

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [userEmail, onLogout]);

  // Verificar se sessão anterior foi fechada inesperadamente
  useEffect(() => {
    if (!userEmail) return;

    const checkOrphanedSession = async () => {
      // Se temos dados no localStorage mas não no sessionStorage,
      // significa que a sessão anterior foi fechada inesperadamente
      const sessionActive = sessionStorage.getItem('session_active');
      const storedUser = localStorage.getItem('auth_user');
      const sessionToken = localStorage.getItem('session_token');

      if (storedUser && sessionToken && !sessionActive) {
        console.log('Sessão órfã detectada, limpando...');
        
        try {
          const userData = JSON.parse(storedUser);
          
          // Limpar sessão órfã do banco
          await supabase
            .from('sessoes_ativas')
            .update({ ativo: false })
            .eq('user_email', userData.email)
            .eq('session_token', sessionToken);

          // Limpar dados locais
          localStorage.removeItem('auth_user');
          localStorage.removeItem('session_token');
          
          console.log('Sessão órfã limpa com sucesso');
        } catch (error) {
          console.error('Erro ao limpar sessão órfã:', error);
        }
      }
    };

    checkOrphanedSession();
  }, [userEmail]);
};
