import { useState, useCallback, useEffect } from 'react';
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
      const realIP = await getRealIP();
      
      // SEGURANÇA: Verificar se já existe sessão ativa para este usuário
      const { data: existingSession } = await supabase
        .from('sessoes_ativas')
        .select('*')
        .eq('user_email', userEmail)
        .eq('ativo', true)
        .maybeSingle();

      // Se já existe sessão ativa, verificar IP
      if (existingSession) {
        if (existingSession.ip_address && existingSession.ip_address !== realIP) {
          throw new Error('USUÁRIO_JA_CONECTADO_OUTRO_IP');
        }
        
        // Se mesmo IP, renovar sessão existente
        const renewed = await supabase.rpc('renovar_sessao', {
          p_user_email: userEmail,
          p_session_token: existingSession.session_token
        });
        
        if (renewed.data) {
          console.log('Sessão existente renovada para:', userEmail);
          setCurrentSession(existingSession);
          localStorage.setItem('session_token', existingSession.session_token);
          return existingSession.session_token;
        }
      }

      // SEGURANÇA: Verificar múltiplas sessões do mesmo IP
      if (realIP) {
        const { data: multipleIpSessions } = await supabase.rpc('verificar_sessoes_multiplas_ip', {
          p_ip_address: realIP
        });
        
        if (multipleIpSessions && multipleIpSessions.length > 0) {
          console.warn('Múltiplas sessões detectadas no IP:', realIP, multipleIpSessions);
        }
      }

      // Marcar usuário como conectado ANTES de criar sessão
      await supabase
        .from('usuarios_sistema')
        .update({ status_conexao: 'conectado' })
        .eq('email', userEmail);

      // Criar nova sessão com expiração de 4 horas
      const { data, error } = await supabase
        .from('sessoes_ativas')
        .insert({
          user_email: userEmail,
          ip_address: realIP,
          last_activity: new Date().toISOString()
          // expires_at usa o DEFAULT de 4 horas configurado no banco
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar sessão:', error);
        if (error.message?.includes('duplicate key value violates unique constraint')) {
          throw new Error('SESSAO_UNICA_VIOLADA');
        }
        return null;
      }

      console.log('Nova sessão criada:', data.session_token, 'para IP:', realIP);
      setCurrentSession(data);
      localStorage.setItem('session_token', data.session_token);
      return data.session_token;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      if (error.message === 'USUÁRIO_JA_CONECTADO_OUTRO_IP') {
        throw new Error('Este usuário já está conectado em outro local. Apenas uma sessão ativa é permitida por usuário.');
      }
      if (error.message === 'SESSAO_UNICA_VIOLADA') {
        throw new Error('Não é possível criar múltiplas sessões para o mesmo usuário.');
      }
      throw error;
    }
  }, []);

  // Função para validação e renovação automática de sessão
  const validateSession = useCallback(async (userEmail: string): Promise<boolean> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) {
        return false;
      }

      // Verificar se usuário está ativo
      const { data: userData, error: userError } = await supabase
        .from('usuarios_sistema')
        .select('status_conexao, ativo')
        .eq('email', userEmail)
        .maybeSingle();

      if (userError || !userData || !userData.ativo) {
        return false;
      }

      // Se usuário foi desconectado por admin, limpar dados locais
      if (userData.status_conexao === 'desconectado') {
        localStorage.removeItem('session_token');
        localStorage.removeItem('auth_user');
        return false;
      }

      // Verificar se sessão ainda existe e está ativa
      const { data, error } = await supabase
        .from('sessoes_ativas')
        .select('*')
        .eq('user_email', userEmail)
        .eq('session_token', sessionToken)
        .eq('ativo', true)
        .maybeSingle();

      if (error || !data) {
        return false;
      }

      // Verificar se sessão não expirou
      if (new Date(data.expires_at) <= new Date()) {
        console.log('Sessão expirada para:', userEmail);
        await invalidateSession(userEmail, 'timeout');
        return false;
      }

      // RENOVAÇÃO AUTOMÁTICA: Se faltam menos de 30 minutos para expirar
      const minutosParaExpirar = (new Date(data.expires_at).getTime() - new Date().getTime()) / (1000 * 60);
      if (minutosParaExpirar < 30) {
        console.log('Renovando sessão automaticamente para:', userEmail);
        await supabase.rpc('renovar_sessao', {
          p_user_email: userEmail,
          p_session_token: sessionToken
        });
      }

      setCurrentSession(data);
      return true;
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      return false;
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
      console.log(`Admin ${adminEmail} tentando desconectar usuário ${targetEmail}`);

      // Verificar se ambos os usuários existem e suas permissões
      const { data: targetUser } = await supabase
        .from('usuarios_sistema')
        .select('tipo_usuario, nome_completo')
        .eq('email', targetEmail)
        .maybeSingle();

      const { data: adminUser } = await supabase
        .from('usuarios_sistema')
        .select('tipo_usuario')
        .eq('email', adminEmail)
        .maybeSingle();

      if (!targetUser || !adminUser) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado.",
          variant: "destructive"
        });
        return false;
      }

      // Validar permissões: admin não pode desconectar outro admin
      if (adminUser.tipo_usuario === 'administrador' && targetUser.tipo_usuario === 'administrador') {
        toast({
          title: "Acesso Negado",
          description: "Administradores não podem desconectar outros administradores.",
          variant: "destructive"
        });
        return false;
      }

      // Apenas admins podem desconectar usuários
      if (adminUser.tipo_usuario !== 'administrador') {
        toast({
          title: "Acesso Negado",
          description: "Apenas administradores podem desconectar usuários.",
          variant: "destructive"
        });
        return false;
      }

      // SEQUÊNCIA CRÍTICA PARA DESCONEXÃO EFETIVA:
      
      // 1. INVALIDAR TODAS as sessões primeiro (mais crítico)
      const { error: sessionError } = await supabase
        .from('sessoes_ativas')
        .update({ 
          ativo: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_email', targetEmail)
        .eq('ativo', true);

      if (sessionError) {
        console.error('Erro ao invalidar sessões:', sessionError);
      }

      // 2. Marcar usuário como desconectado
      const { error: userError } = await supabase
        .from('usuarios_sistema')
        .update({ status_conexao: 'desconectado' })
        .eq('email', targetEmail);

      if (userError) {
        console.error('Erro ao marcar usuário como desconectado:', userError);
        toast({
          title: "Erro",
          description: "Não foi possível desconectar o usuário completamente.",
          variant: "destructive"
        });
        return false;
      }

      // 3. Registrar log de acesso
      await registerAccessLog(targetEmail, 'desconectado_admin', adminEmail);

      // 4. SISTEMA REALTIME MÚLTIPLO para garantir desconexão instantânea
      const forceDisconnectSequence = async () => {
        const channels = [
          'admin-disconnect',
          `user-${targetEmail}`,
          `force-logout-${targetEmail}`,
          'global-security',
          'session-killer'
        ];

        // Mensagens imediatas em todos os canais
        for (const channelName of channels) {
          try {
            const channel = supabase.channel(channelName);
            await channel.send({
              type: 'broadcast',
              event: 'force_logout',
              payload: { 
                targetEmail,
                reason: 'Desconectado por administrador',
                adminEmail,
                timestamp: new Date().toISOString(),
                critical: true
              }
            });
            
            // Desinscrever canal imediatamente após uso
            setTimeout(() => supabase.removeChannel(channel), 1000);
          } catch (err) {
            console.error(`Erro no canal ${channelName}:`, err);
          }
        }

        // Repetir comando após 3 segundos para garantir
        setTimeout(async () => {
          for (const channelName of channels) {
            try {
              const channel = supabase.channel(`${channelName}-retry`);
              await channel.send({
                type: 'broadcast',
                event: 'force_logout',
                payload: { 
                  targetEmail,
                  reason: 'Desconectado por administrador (retry)',
                  adminEmail,
                  timestamp: new Date().toISOString(),
                  retry: true
                }
              });
              setTimeout(() => supabase.removeChannel(channel), 1000);
            } catch (err) {
              console.error(`Erro no retry ${channelName}:`, err);
            }
          }
        }, 3000);
      };

      // Executar desconexão realtime
      await forceDisconnectSequence();

      console.log(`Usuário ${targetEmail} desconectado com sucesso por ${adminEmail}`);
      
      toast({
        title: "Sucesso", 
        description: `Usuário ${targetEmail} foi desconectado com sucesso.`
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

  // Setup realtime listener para sessões ativas
  useEffect(() => {
    const channel = supabase
      .channel('sessoes-ativas-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sessoes_ativas'
      }, (payload) => {
        console.log('Sessões ativas realtime event:', payload);
        // Atualizar dados automaticamente quando há mudanças nas sessões
        // Não fazemos fetch automático para evitar loops, deixamos os componentes decidir
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Função para limpar sessões expiradas (chamada periodicamente)
  const cleanupExpiredSessions = useCallback(async () => {
    try {
      await supabase.rpc('limpar_sessoes_expiradas');
    } catch (error) {
      console.error('Erro ao limpar sessões expiradas:', error);
    }
  }, []);

  // Cleanup automático a cada 5 minutos
  useEffect(() => {
    const cleanup = setInterval(cleanupExpiredSessions, 5 * 60 * 1000); // 5 minutos
    
    // Executar uma vez imediatamente
    cleanupExpiredSessions();
    
    return () => clearInterval(cleanup);
  }, [cleanupExpiredSessions]);

  return {
    currentSession,
    createSession,
    validateSession,
    invalidateSession,
    disconnectUserByAdmin,
    getActiveUsers,
    registerAccessLog,
    cleanupExpiredSessions
  };
};