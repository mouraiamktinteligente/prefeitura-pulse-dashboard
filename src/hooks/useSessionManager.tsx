import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SessionData {
  id: string;
  session_token: string;
  expires_at: string;
  last_activity: string;
  ativo: boolean;
}

export const useSessionManager = () => {
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const { toast } = useToast();

  // Função para obter o IP real do usuário
  const getRealIP = async (): Promise<string | null> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Erro ao obter IP:', error);
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return data.ip;
      } catch (fallbackError) {
        console.error('Erro ao obter IP (fallback):', fallbackError);
        return null;
      }
    }
  };

  // Função para detectar o navegador correto
  const getRealBrowser = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'Safari';
    }
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      return 'Chrome';
    }
    if (userAgent.includes('Edg')) {
      return 'Edge';
    }
    if (userAgent.includes('Firefox')) {
      return 'Firefox';
    }
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      return 'Opera';
    }
    return 'Desconhecido';
  };

  // Função para obter data/hora no timezone de São Paulo
  const getBrazilDateTime = (): string => {
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    return brazilTime.toISOString();
  };

  const registerAccessLog = async (email: string, statusConexao: 'login' | 'logout' | 'desconectado_admin' | 'timeout' | 'erro_sessao' = 'login', adminEmail?: string) => {
    try {
      if (statusConexao === 'login') {
        const realIP = await getRealIP();
        const realBrowser = getRealBrowser();
        const brazilDateTime = getBrazilDateTime();
        
        await supabase
          .from('logs_acesso')
          .insert({
            email_usuario: email,
            data_hora_login: brazilDateTime,
            ip_address: realIP,
            user_agent: realBrowser,
            session_id: null,
            status_conexao: statusConexao
          });
      } else {
        const { data: latestLog } = await supabase
          .from('logs_acesso')
          .select('*')
          .eq('email_usuario', email)
          .is('data_hora_logout', null)
          .order('data_hora_login', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestLog) {
          const brazilDateTime = getBrazilDateTime();
          
          await supabase
            .from('logs_acesso')
            .update({ 
              data_hora_logout: brazilDateTime,
              updated_at: brazilDateTime,
              status_conexao: statusConexao
            })
            .eq('id', latestLog.id);
        }

        if (statusConexao === 'desconectado_admin' && adminEmail) {
          await supabase
            .from('registro_movimentacoes')
            .insert({
              email_usuario: adminEmail,
              acao_realizada: 'Desconectar usuário',
              tabela_afetada: 'usuarios_sistema',
              dados_novos: { 
                usuario_desconectado: email, 
                motivo: 'Desconectado por administrador',
                data_hora: new Date().toISOString()
              }
            });
        }
      }
    } catch (error) {
      console.error('Erro ao registrar log de acesso:', error);
    }
  };

  const createSession = useCallback(async (userEmail: string): Promise<string | null> => {
    try {
      // Invalidar sessões antigas do usuário
      await supabase
        .from('sessoes_ativas')
        .update({ ativo: false })
        .eq('user_email', userEmail)
        .eq('ativo', true);

      // Marcar usuário como conectado
      await supabase
        .from('usuarios_sistema')
        .update({ status_conexao: 'conectado' })
        .eq('email', userEmail);

      // Criar nova sessão
      const { data, error } = await supabase
        .from('sessoes_ativas')
        .insert({
          user_email: userEmail,
          last_activity: new Date().toISOString(),
          expires_at: new Date(Date.now() + 20 * 60 * 1000).toISOString() // 20 minutos
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar sessão:', error);
        return null;
      }

      setCurrentSession(data);
      localStorage.setItem('session_token', data.session_token);
      return data.session_token;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      return null;
    }
  }, []);

  const validateSession = useCallback(async (userEmail: string, retryCount: number = 0): Promise<boolean> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) {
        console.log('validateSession: Nenhum token encontrado');
        return false;
      }

      console.log('validateSession: Validando sessão para:', userEmail);

      // CRÍTICO: Verificar primeiro se o usuário está marcado como conectado
      const { data: userData, error: userError } = await supabase
        .from('usuarios_sistema')
        .select('status_conexao, ativo')
        .eq('email', userEmail)
        .maybeSingle();

      if (userError || !userData) {
        console.log('validateSession: Erro ao verificar status do usuário ou usuário não encontrado');
        await registerAccessLog(userEmail, 'erro_sessao');
        return false;
      }

      // Se usuário inativo ou desconectado, invalidar imediatamente
      if (!userData.ativo || userData.status_conexao !== 'conectado') {
        console.log('validateSession: Usuário inativo ou marcado como desconectado');
        localStorage.removeItem('session_token');
        localStorage.removeItem('auth_user');
        await registerAccessLog(userEmail, userData.status_conexao === 'desconectado' ? 'desconectado_admin' : 'erro_sessao');
        return false;
      }

      // Verificar sessão ativa
      const { data, error } = await supabase
        .from('sessoes_ativas')
        .select('*')
        .eq('user_email', userEmail)
        .eq('session_token', sessionToken)
        .eq('ativo', true)
        .maybeSingle();

      if (error) {
        console.error('Erro ao validar sessão:', error);
        await registerAccessLog(userEmail, 'erro_sessao');
        return false;
      }

      if (!data) {
        console.log('validateSession: Sessão não encontrada ou inativa na base de dados');
        localStorage.removeItem('session_token');
        localStorage.removeItem('auth_user');
        await registerAccessLog(userEmail, 'erro_sessao');
        return false;
      }

      // Verificar se sessão expirou
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now > expiresAt) {
        console.log('validateSession: Sessão expirada');
        await invalidateSession(userEmail, 'timeout');
        return false;
      }

      console.log('validateSession: Sessão válida');
      setCurrentSession(data);
      return true;
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      await registerAccessLog(userEmail, 'erro_sessao');
      return false;
    }
  }, []);

  const updateActivity = useCallback(async (userEmail: string): Promise<void> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) return;

      const newExpiresAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('sessoes_ativas')
        .update({
          last_activity: new Date().toISOString(),
          expires_at: newExpiresAt
        })
        .eq('user_email', userEmail)
        .eq('session_token', sessionToken)
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao atualizar atividade:', error);
      }
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
    }
  }, []);

  const invalidateSession = useCallback(async (userEmail: string, motivo: 'logout' | 'timeout' | 'erro_sessao' | 'desconectado_admin' = 'logout'): Promise<void> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      
      // Marcar usuário como desconectado
      await supabase
        .from('usuarios_sistema')
        .update({ status_conexao: 'desconectado' })
        .eq('email', userEmail);
      
      if (sessionToken) {
        await supabase
          .from('sessoes_ativas')
          .update({ ativo: false })
          .eq('user_email', userEmail)
          .eq('session_token', sessionToken);
      }

      // Registrar o motivo da desconexão
      await registerAccessLog(userEmail, motivo);

      localStorage.removeItem('session_token');
      localStorage.removeItem('auth_user');
      setCurrentSession(null);
    } catch (error) {
      console.error('Erro ao invalidar sessão:', error);
    }
  }, []);

  const disconnectUserByAdmin = useCallback(async (targetEmail: string, adminEmail: string): Promise<boolean> => {
    try {
      console.log(`Admin ${adminEmail} desconectando usuário ${targetEmail}`);

      // 1. PRIMEIRO: Marcar usuário como desconectado (fonte única da verdade)
      const { error: userError } = await supabase
        .from('usuarios_sistema')
        .update({ status_conexao: 'desconectado' })
        .eq('email', targetEmail);

      if (userError) {
        console.error('Erro ao marcar usuário como desconectado:', userError);
        toast({
          title: "Erro",
          description: "Não foi possível desconectar o usuário.",
          variant: "destructive"
        });
        return false;
      }

      // 2. Invalidar TODAS as sessões do usuário alvo
      await supabase
        .from('sessoes_ativas')
        .update({ 
          ativo: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_email', targetEmail)
        .eq('ativo', true);

      // 3. Registrar log de acesso com status específico
      await registerAccessLog(targetEmail, 'desconectado_admin', adminEmail);

      // 4. Emitir múltiplos eventos realtime para forçar desconexão imediata
      const adminChannel = supabase.channel('admin-disconnect');
      const userChannel = supabase.channel(`user-${targetEmail}`);
      
      // Broadcast para canal geral
      await adminChannel.send({
        type: 'broadcast',
        event: 'user_disconnected',
        payload: { targetEmail, disconnectedAt: new Date().toISOString(), adminEmail }
      });

      // Broadcast para canal específico do usuário
      await userChannel.send({
        type: 'broadcast',
        event: 'force_logout',
        payload: { reason: 'Desconectado por administrador', adminEmail }
      });

      console.log(`Usuário ${targetEmail} desconectado com sucesso por ${adminEmail}`);
      
      toast({
        title: "Sucesso",
        description: "Usuário desconectado com sucesso."
      });
      return true;
    } catch (error) {
      console.error('Erro ao desconectar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desconectar o usuário.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const getActiveUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sessoes_ativas')
        .select(`
          user_email,
          last_activity,
          expires_at,
          created_at
        `)
        .eq('ativo', true)
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('Erro ao buscar usuários ativos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar usuários ativos:', error);
      return [];
    }
  }, []);

  return {
    currentSession,
    createSession,
    validateSession,
    updateActivity,
    invalidateSession,
    disconnectUserByAdmin,
    getActiveUsers,
    registerAccessLog
  };
};