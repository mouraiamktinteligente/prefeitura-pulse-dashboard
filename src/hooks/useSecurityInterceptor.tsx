import { useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface UseSecurityInterceptorProps {
  userEmail: string | null;
  onForceLogout: (reason: string) => void;
}

export const useSecurityInterceptor = ({ userEmail, onForceLogout }: UseSecurityInterceptorProps) => {
  const heartbeatRef = useRef<NodeJS.Timeout>();
  const forceReloadRef = useRef<NodeJS.Timeout>();
  const initDelayRef = useRef<NodeJS.Timeout>();
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    if (!userEmail) return;

    console.log('Iniciando interceptador de segurança para:', userEmail);

    // Aguardar 10 segundos antes de iniciar verificações para evitar logout durante refresh
    initDelayRef.current = setTimeout(() => {
      startHeartbeat();
    }, 10000);

    // Sistema de heartbeat melhorado
    const startHeartbeat = () => {
      heartbeatRef.current = setInterval(async () => {
        try {
          const now = Date.now();
          
          // Evitar verificações muito frequentes (debounce)
          if (now - lastCheckRef.current < 4000) {
            return;
          }
          lastCheckRef.current = now;

          console.log('Security check para:', userEmail);

          const { data: userData } = await supabase
            .from('usuarios_sistema')
            .select('status_conexao, ativo')
            .eq('email', userEmail)
            .maybeSingle();

          if (!userData || !userData.ativo) {
            console.log('Heartbeat: Usuário inativo ou removido - iniciando logout forçado');
            clearInterval(heartbeatRef.current!);
            
            // Limpar localStorage imediatamente
            localStorage.removeItem('auth_user');
            localStorage.removeItem('session_token');
            
            onForceLogout('Sua conta foi desativada');
            
            forceReloadRef.current = setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
            return;
          }

          if (userData.status_conexao === 'desconectado') {
            console.log('Heartbeat: Usuário marcado como desconectado - iniciando logout forçado');
            clearInterval(heartbeatRef.current!);
            
            // Limpar localStorage imediatamente
            localStorage.removeItem('auth_user');
            localStorage.removeItem('session_token');
            
            onForceLogout('Você foi desconectado por um administrador');
            
            forceReloadRef.current = setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          }
        } catch (error) {
          console.error('Erro no heartbeat:', error);
        }
      }, 5000); // Verificar a cada 5 segundos (menos agressivo)
    };

    return () => {
      // Limpar init delay
      if (initDelayRef.current) {
        clearTimeout(initDelayRef.current);
      }
      
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