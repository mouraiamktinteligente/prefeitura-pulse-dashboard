import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useSessionManager } from "./useSessionManager";
import { useBrowserEvents } from "./useBrowserEvents";
import { AuthContext } from "@/contexts/auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forceLogoutReason, setForceLogoutReason] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const sessionManager = useSessionManager();


  // Função para obter o IP real do usuário
  const getRealIP = async (): Promise<string | null> => {
    try {
      // Usar serviço público para obter IP real
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Erro ao obter IP:', error);
      // Fallback: tentar outro serviço
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
    
    // Detectar Safari primeiro (deve vir antes do Chrome)
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'Safari';
    }
    
    // Detectar Chrome
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      return 'Chrome';
    }
    
    // Detectar Edge
    if (userAgent.includes('Edg')) {
      return 'Edge';
    }
    
    // Detectar Firefox
    if (userAgent.includes('Firefox')) {
      return 'Firefox';
    }
    
    // Detectar Opera
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      return 'Opera';
    }
    
    // Fallback
    return 'Desconhecido';
  };

  // Função para obter data/hora no timezone de São Paulo (correto)
  const getBrazilDateTime = (): string => {
    const now = new Date();
    // Usar o método correto para converter para o timezone de São Paulo
    const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    return brazilTime.toISOString();
  };

  const registerAccessLog = async (email: string, isLogin: boolean = true) => {
    try {
      if (isLogin) {
        // Obter IP real e navegador correto
        const realIP = await getRealIP();
        const realBrowser = getRealBrowser();
        const brazilDateTime = getBrazilDateTime();
        
        console.log('IP capturado:', realIP);
        console.log('Navegador detectado:', realBrowser);
        console.log('Data/Hora Brasil:', brazilDateTime);
        
        // Registrar login
        await supabase
          .from('logs_acesso')
          .insert({
            email_usuario: email,
            data_hora_login: brazilDateTime,
            ip_address: realIP,
            user_agent: realBrowser, // Salvar apenas o nome do navegador
            session_id: null
          });
      } else {
        // Atualizar logout
        const { data: latestLog } = await supabase
          .from('logs_acesso')
          .select('*')
          .eq('email_usuario', email)
          .is('data_hora_logout', null)
          .order('data_hora_login', { ascending: false })
          .limit(1)
          .single();

        if (latestLog) {
          const brazilDateTime = getBrazilDateTime();
          console.log('Data/Hora Logout Brasil:', brazilDateTime);
          
          await supabase
            .from('logs_acesso')
            .update({ 
              data_hora_logout: brazilDateTime,
              updated_at: brazilDateTime
            })
            .eq('id', latestLog.id);
        }
      }
    } catch (error) {
      console.error('Erro ao registrar log de acesso:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Verificando login para:', email);
      
      // LIMPAR mensagem de erro anterior IMEDIATAMENTE no login
      setForceLogoutReason(null);
      
      // Buscar usuário na tabela usuarios_sistema
      const { data: userData, error: userError } = await supabase
        .from('usuarios_sistema')
        .select('*')
        .eq('email', email)
        .eq('ativo', true)
        .maybeSingle();

      if (userError) {
        console.error('Erro ao verificar usuário:', userError);
        return { error: { message: 'Credenciais inválidas' } };
      }

      if (!userData) {
        console.log('Usuário não encontrado');
        return { error: { message: 'Credenciais inválidas' } };
      }

      // Comparar senha diretamente
      if (userData.senha_hash !== password) {
        console.log('Senha incorreta');
        return { error: { message: 'Credenciais inválidas' } };
      }

      console.log('Login aprovado para:', userData.email);
      
      try {
        // Criar sessão ativa com verificação de IP e sessão única
        const sessionToken = await sessionManager.createSession(userData.email);
        if (!sessionToken) {
          return { error: { message: 'Erro ao criar sessão' } };
        }
        
        // Criar objeto de usuário
        const authenticatedUser = {
          id: userData.id,
          email: userData.email,
          nome_completo: userData.nome_completo,
          tipo_usuario: userData.tipo_usuario,
          permissoes: userData.permissoes
        };

        setUser(authenticatedUser);
        localStorage.setItem('auth_user', JSON.stringify(authenticatedUser));
        
        // Registrar log de acesso com IP real e navegador correto
        await sessionManager.registerAccessLog(userData.email, 'login');
        
        return { error: null };
      } catch (sessionError) {
        console.error('Erro ao criar sessão no signIn:', sessionError);
        console.log('Mensagem do erro de sessão:', sessionError.message);
        
        // Capturar e retornar erro específico de usuário já conectado
        if (sessionError.message?.includes('Este usuário já está conectado')) {
          console.log('Retornando erro de usuário já conectado:', sessionError.message);
          return { error: { message: sessionError.message } };
        }
        if (sessionError.message?.includes('já possui uma sessão ativa')) {
          return { error: { message: sessionError.message } };
        }
        if (sessionError.message?.includes('USUARIO_JA_CONECTADO')) {
          return { error: { message: 'Este usuário já está conectado. Para ter acesso, utilize outro login e senha.' } };
        }
        
        return { error: { message: 'Erro ao estabelecer sessão. Tente novamente.' } };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { error: { message: 'Credenciais inválidas' } };
    }
  };

  const logout = async (reason?: string) => {
    const currentUser = user;
    
    // Invalidar sessão ativa
    if (currentUser?.email) {
      const motivo = reason?.includes('inatividade') ? 'timeout' : 
                   reason?.includes('administrador') ? 'desconectado_admin' : 'logout';
      await sessionManager.invalidateSession(currentUser.email, motivo);
    }
    
    setUser(null);
    localStorage.removeItem('auth_user');
    
    if (reason) {
      setForceLogoutReason(reason);
    }
  };

  // Implementar detecção de fechamento do navegador APÓS definir logout
  useBrowserEvents({
    userEmail: user?.email || null,
    onLogout: logout
  });



  // Listener MÚLTIPLO para desconexão forçada por admin
  useEffect(() => {
    if (!user?.email) return;

    // Múltiplos canais para garantir que a mensagem chegue
    const channels = [
      'admin-disconnect',
      `user-${user.email}`,
      `force-logout-${user.email}`,
      'global-security',
      'session-killer'
    ];

    const subscriptions = channels.map((channelName) => {
      return supabase
        .channel(channelName)
        .on('broadcast', { event: 'force_logout' }, (payload) => {
          if (payload.targetEmail === user.email || payload.critical) {
            console.log(`Logout forçado recebido via canal ${channelName}:`, payload);
            logout('Você foi desconectado por um administrador');
          }
        })
        .subscribe();
    });

    return () => {
      subscriptions.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [user?.email]);

  // Listener para mudanças no status de conexão do usuário
  useEffect(() => {
    if (!user?.email) return;

    const channel = supabase
      .channel('user-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'usuarios_sistema',
          filter: `email=eq.${user.email}`
        },
        (payload) => {
          const newRecord = payload.new as any;
          if (newRecord && newRecord.status_conexao === 'desconectado') {
            console.log('Usuário marcado como desconectado - forçando logout');
            logout('Você foi desconectado por um administrador');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email]);

  useEffect(() => {
    console.log('Verificando usuário salvo...');
    
    const initializeAuth = async () => {
      setIsRefreshing(true);
      
      const savedUser = localStorage.getItem('auth_user');
      const sessionToken = localStorage.getItem('session_token');
      
      if (savedUser && sessionToken) {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log('Usuário encontrado no localStorage:', parsedUser.email);
          
          // Verificação simplificada: apenas verificar se a sessão existe e está ativa
          const { data: sessionData, error } = await supabase
            .from('sessoes_ativas')
            .select('*')
            .eq('user_email', parsedUser.email)
            .eq('session_token', sessionToken)
            .eq('ativo', true)
            .maybeSingle();
          
          if (!error && sessionData) {
            // Verificar se a sessão não expirou por inatividade (15 minutos)
            const lastActivity = new Date(sessionData.last_activity);
            const now = new Date();
            const minutosInativo = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
            
            if (minutosInativo <= 15) {
              console.log('Sessão válida encontrada, restaurando usuário...');
              
              // Atualizar atividade para renovar a sessão
              await supabase
                .from('sessoes_ativas')
                .update({ 
                  last_activity: new Date().toISOString(),
                  expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
                })
                .eq('id', sessionData.id);
              
              // Garantir que usuário está marcado como conectado
              await supabase
                .from('usuarios_sistema')
                .update({ status_conexao: 'conectado' })
                .eq('email', parsedUser.email);
              
              setUser(parsedUser);
              setForceLogoutReason(null);
              setIsLoading(false);
              setIsRefreshing(false);
              return;
            } else {
              console.log(`Sessão expirada por inatividade (${minutosInativo.toFixed(1)} minutos)`);
            }
          }
          
          // Se chegou aqui, sessão é inválida - limpar dados
          console.log('Sessão inválida, limpando dados locais');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('session_token');
          
        } catch (error) {
          console.error('Erro ao recuperar usuário:', error);
          localStorage.removeItem('auth_user');
          localStorage.removeItem('session_token');
        }
      }
      
      setIsLoading(false);
      setIsRefreshing(false);
    };

    initializeAuth();
  }, []);

  // Auto-limpar mensagens de erro após 10 segundos
  useEffect(() => {
    if (forceLogoutReason) {
      const timeout = setTimeout(() => {
        setForceLogoutReason(null);
      }, 10000); // 10 segundos

      return () => clearTimeout(timeout);
    }
  }, [forceLogoutReason]);

  // VALIDAÇÃO PERIÓDICA DE SESSÃO REMOVIDA - agora é feita pelo useBrowserEvents

  // ACTIVITY TRACKING REMOVIDO - agora é feito pelo useBrowserEvents

  return (
    <AuthContext.Provider value={{ user, logout, isLoading, signIn }}>
      {children}
      
      {forceLogoutReason && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 shadow-lg">
          <div className="flex items-center justify-between">
            <span>{forceLogoutReason}</span>
            <button 
              onClick={() => setForceLogoutReason(null)}
              className="ml-4 text-red-500 hover:text-red-700 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
