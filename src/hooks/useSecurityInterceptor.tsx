import { useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface UseSecurityInterceptorProps {
  userEmail: string | null;
  onForceLogout: (reason: string) => void;
}

export const useSecurityInterceptor = ({ userEmail, onForceLogout }: UseSecurityInterceptorProps) => {
  const heartbeatRef = useRef<NodeJS.Timeout>();
  const forceReloadRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!userEmail) return;

    console.log('Iniciando interceptador de segurança para:', userEmail);

    // Sistema de heartbeat agressivo para detecção ultra-rápida
    const startHeartbeat = () => {
      heartbeatRef.current = setInterval(async () => {
        try {
          const { data: userData } = await supabase
            .from('usuarios_sistema')
            .select('status_conexao, ativo')
            .eq('email', userEmail)
            .maybeSingle();

          if (!userData || !userData.ativo || userData.status_conexao !== 'conectado') {
            console.log('Heartbeat: Usuário desconectado detectado - iniciando logout forçado');
            clearInterval(heartbeatRef.current!);
            
            // Limpar localStorage imediatamente
            localStorage.removeItem('auth_user');
            localStorage.removeItem('session_token');
            
            onForceLogout('Você foi desconectado por um administrador');
            
            // Forçar reload da página após um breve delay para garantir limpeza completa
            forceReloadRef.current = setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          }
        } catch (error) {
          console.error('Erro no heartbeat:', error);
        }
      }, 1500); // Verificar a cada 1.5 segundos (ultra agressivo)
    };

    startHeartbeat();

    return () => {
      // Limpar heartbeat
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      
      // Limpar timeout de reload
      if (forceReloadRef.current) {
        clearTimeout(forceReloadRef.current);
      }
    };
  }, [userEmail, onForceLogout]);

  // Função para forçar verificação imediata
  const forceSecurityCheck = async () => {
    if (!userEmail) return true;

    try {
      const { data: userData } = await supabase
        .from('usuarios_sistema')
        .select('status_conexao, ativo')
        .eq('email', userEmail)
        .maybeSingle();

      const isValid = userData && userData.ativo && userData.status_conexao === 'conectado';
      
      if (!isValid) {
        console.log('Verificação de segurança forçada: Usuário inválido');
        
        // Limpar localStorage imediatamente
        localStorage.removeItem('auth_user');
        localStorage.removeItem('session_token');
        
        onForceLogout('Você foi desconectado por um administrador');
        
        // Forçar reload
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro na verificação de segurança:', error);
      return false;
    }
  };

  return { forceSecurityCheck };
};