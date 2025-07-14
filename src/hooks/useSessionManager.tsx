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
        // CRITICAL: Verificar se já existe um log de login recente (últimos 30 segundos) para evitar duplicatas
        const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
        const { data: recentLog } = await supabase
          .from('logs_acesso')
          .select('*')
          .eq('email_usuario', email)
          .is('data_hora_logout', null)
          .gte('data_hora_login', thirtySecondsAgo)
          .maybeSingle();

        if (recentLog) {
          console.log('Log de login recente encontrado, evitando duplicata');
          return;
        }

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
      // CRITICAL: Verificar se já existe sessão ativa antes de criar nova
      const { data: existingSession } = await supabase
        .from('sessoes_ativas')
        .select('*')
        .eq('user_email', userEmail)
        .eq('ativo', true)
        .maybeSingle();

      // Se já existe sessão ativa e não expirou, retornar ela
      if (existingSession && new Date(existingSession.expires_at) > new Date()) {
        console.log('Sessão ativa existente encontrada, reutilizando...');
        setCurrentSession(existingSession);
        localStorage.setItem('session_token', existingSession.session_token);
        return existingSession.session_token;
      }

      // Invalidar todas as sessões antigas antes de criar nova
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

      // Criar nova sessão - 30 minutos
      const { data, error } = await supabase
        .from('sessoes_ativas')
        .insert({
          user_email: userEmail,
          last_activity: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar sessão:', error);
        return null;
      }

      console.log('Nova sessão criada:', data.session_token);
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

      console.log('validateSession: Validando sessão para:', userEmail, 'tentativa:', retryCount + 1);

      // Implementar retry com limite
      const maxRetries = 2;
      if (retryCount >= maxRetries) {
        console.log('validateSession: Máximo de tentativas atingido');
        await registerAccessLog(userEmail, 'erro_sessao');
        return false;
      }

      // CRÍTICO: Verificar primeiro se o usuário está marcado como conectado
      const { data: userData, error: userError } = await supabase
        .from('usuarios_sistema')
        .select('status_conexao, ativo')
        .eq('email', userEmail)
        .maybeSingle();

      if (userError || !userData) {
        console.log('validateSession: Erro ao verificar status do usuário ou usuário não encontrado, tentativa:', retryCount + 1);
        if (retryCount < maxRetries) {
          console.log('validateSession: Tentando novamente em 2 segundos...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          return validateSession(userEmail, retryCount + 1);
        }
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
        console.error('Erro ao validar sessão:', error, 'tentativa:', retryCount + 1);
        if (retryCount < maxRetries) {
          console.log('validateSession: Tentando novamente em 2 segundos...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          return validateSession(userEmail, retryCount + 1);
        }
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

      const newExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // CORRIGIDO para 30 minutos

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

      // 4. Sistema de ping-pong escalado para garantir desconexão
      const forceDisconnectSequence = async () => {
        const channels = [
          supabase.channel('admin-disconnect'),
          supabase.channel(`user-${targetEmail}`),
          supabase.channel(`force-logout-${targetEmail}`),
          supabase.channel('global-security')
        ];

        // Enviar múltiplas mensagens em intervalos crescentes
        const intervals = [0, 2000, 5000, 10000]; // 0s, 2s, 5s, 10s
        
        intervals.forEach((delay, index) => {
          setTimeout(async () => {
            console.log(`Enviando comando de desconexão #${index + 1} para ${targetEmail}`);
            
            for (const channel of channels) {
              try {
                await channel.send({
                  type: 'broadcast',
                  event: 'force_logout',
                  payload: { 
                    targetEmail,
                    reason: 'Desconectado por administrador',
                    adminEmail,
                    attempt: index + 1,
                    timestamp: new Date().toISOString()
                  }
                });
              } catch (err) {
                console.error(`Erro ao enviar por canal ${channel.topic}:`, err);
              }
            }
          }, delay);
        });

        // Cleanup dos canais após 15 segundos
        setTimeout(() => {
          channels.forEach(channel => {
            try {
              supabase.removeChannel(channel);
            } catch (err) {
              console.error('Erro ao remover canal:', err);
            }
          });
        }, 15000);
      };

      // Executar sequência de desconexão
      await forceDisconnectSequence();

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