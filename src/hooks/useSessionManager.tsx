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
    if (!userEmail) {
      throw new Error('Email do usuário é obrigatório');
    }

    // Normalizar email antes de qualquer operação
    const normalizedEmail = userEmail.trim().toLowerCase();
    
    try {
      const realIP = await getRealIP();
      
      console.log(`[SESSÃO] Iniciando criação de sessão para: ${normalizedEmail}`);
      
      // IMPORTANTE: O trigger do banco irá automaticamente desconectar outras sessões
      // Não precisamos fazer verificação manual aqui pois o banco garante atomicidade

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
        .eq('email', normalizedEmail);

      // CRIAR SESSÃO: O trigger automaticamente previne múltiplas sessões
      console.log(`[SESSÃO] Criando nova sessão para: ${normalizedEmail} no IP: ${realIP}`);
      
      const { data, error } = await supabase
        .from('sessoes_ativas')
        .insert({
          user_email: normalizedEmail,  // Usar email normalizado
          ip_address: realIP,
          last_activity: new Date().toISOString()
          // expires_at usa o DEFAULT de 15 minutos configurado no banco
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar sessão:', error);
        console.log('Código do erro:', error.code);
        console.log('Detalhes do erro:', error.details);
        console.log('Mensagem completa:', error.message);
        
        // Capturar erro específico de usuário já conectado do trigger
        if (error.message?.includes('USUARIO_JA_CONECTADO')) {
          const errorMessage = 'Este usuário já está conectado. Para ter acesso, utilize outro login e senha.';
          console.log('Erro de sessão única detectado, lançando:', errorMessage);
          throw new Error(errorMessage);
        }
        
        if (error.code === 'P0001' || error.message?.includes('Este usuário já está conectado')) {
          const errorMessage = 'Este usuário já está conectado. Para ter acesso, utilize outro login e senha.';
          console.log('Erro P0001 detectado, lançando:', errorMessage);
          throw new Error(errorMessage);
        }
        
        if (error.message?.includes('duplicate key value violates unique constraint')) {
          throw new Error('Este usuário já possui uma sessão ativa.');
        }
        
        throw new Error('Erro interno ao criar sessão');
      }

      console.log('Nova sessão criada:', data.session_token, 'para IP:', realIP);
      setCurrentSession(data);
      localStorage.setItem('session_token', data.session_token);
      return data.session_token;
    } catch (error) {
      console.error('Erro geral ao criar sessão:', error);
      console.log('Tipo do erro:', typeof error);
      console.log('Mensagem do erro:', error.message);
      
      // Propagar erros de sessão única sem alteração
      if (error.message?.includes('Este usuário já está conectado')) {
        console.log('Propagando erro de sessão única:', error.message);
        throw error; // Repassar a mensagem exata
      }
      if (error.message?.includes('USUARIO_JA_CONECTADO')) {
        throw new Error('Este usuário já está conectado. Para ter acesso, utilize outro login e senha.');
      }
      if (error.message === 'SESSAO_UNICA_VIOLADA') {
        throw new Error('Este usuário já possui uma sessão ativa.');
      }
      
      throw error;
    }
  }, []);

  // Função para atualizar atividade do usuário
  const updateUserActivity = useCallback(async (userEmail: string): Promise<void> => {
    const normalizedEmail = userEmail.trim().toLowerCase();
    const sessionToken = localStorage.getItem('session_token');
    
    if (!sessionToken) return;
    
    try {
      // Atualizar last_activity na sessão ativa
      await supabase
        .from('sessoes_ativas')
        .update({ 
          last_activity: new Date().toISOString(),
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // Mais 15 minutos
        })
        .eq('user_email', normalizedEmail)
        .eq('session_token', sessionToken)
        .eq('ativo', true);
        
      console.log('Atividade atualizada para:', normalizedEmail);
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
    }
  }, []);

  // Função para validação baseada em inatividade de 15 minutos
  const validateSession = useCallback(async (userEmail: string): Promise<boolean> => {
    const normalizedEmail = userEmail.trim().toLowerCase();
    
    try {
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) {
        return false;
      }

      // Verificar se usuário está ativo
      const { data: userData, error: userError } = await supabase
        .from('usuarios_sistema')
        .select('status_conexao, ativo')
        .eq('email', normalizedEmail)
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
        .eq('user_email', normalizedEmail)
        .eq('session_token', sessionToken)
        .eq('ativo', true)
        .maybeSingle();

      if (error || !data) {
        return false;
      }

      // Verificar inatividade de 15 minutos baseada em last_activity
      const lastActivity = new Date(data.last_activity);
      const now = new Date();
      const minutosInativo = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
      
      if (minutosInativo > 15) {
        console.log(`Sessão expirada por inatividade (${minutosInativo.toFixed(1)} minutos) para:`, userEmail);
        await invalidateSession(userEmail, 'timeout');
        return false;
      }

      // Atualizar atividade automaticamente na validação
      await updateUserActivity(normalizedEmail);

      setCurrentSession(data);
      return true;
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      return false;
    }
  }, [updateUserActivity]);


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
    updateUserActivity,
    invalidateSession,
    disconnectUserByAdmin,
    getActiveUsers,
    registerAccessLog,
    cleanupExpiredSessions
  };
};