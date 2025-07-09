import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useSessionManager } from "./useSessionManager";
import { useActivityDetector } from "./useActivityDetector";
import { useInactivityTimer } from "./useInactivityTimer";
import { InactivityModal } from "@/components/InactivityModal";

interface AuthContextType {
  user: any | null;
  logout: (reason?: string) => Promise<void>;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forceLogoutReason, setForceLogoutReason] = useState<string | null>(null);
  
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
      
      // Criar sessão ativa
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
      await registerAccessLog(userData.email, true);
      
      return { error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      return { error: { message: 'Credenciais inválidas' } };
    }
  };

  const logout = async (reason?: string) => {
    const currentUser = user;
    
    // Invalidar sessão ativa
    if (currentUser?.email) {
      await sessionManager.invalidateSession(currentUser.email);
      await registerAccessLog(currentUser.email, false);
    }
    
    setUser(null);
    localStorage.removeItem('auth_user');
    
    if (reason) {
      setForceLogoutReason(reason);
    }
  };

  // Timer de inatividade
  const {
    isWarningShown,
    timeUntilExpiry,
    resetTimer,
    extendSession,
    forceTimeout
  } = useInactivityTimer({
    timeout: 20 * 60 * 1000, // 20 minutos
    warningTime: 2 * 60 * 1000, // 2 minutos de aviso
    onWarning: () => {
      console.log('Aviso de inatividade mostrado');
    },
    onTimeout: () => {
      logout('Sessão expirada por inatividade');
    },
    enabled: !!user
  });

  // Detector de atividade
  useActivityDetector({
    onActivity: () => {
      if (user?.email) {
        sessionManager.updateActivity(user.email);
        resetTimer();
      }
    },
    throttleMs: 30000 // 30 segundos
  });

  // Verificação periódica de sessão
  useEffect(() => {
    if (!user?.email) return;

    const checkSession = async () => {
      const isValid = await sessionManager.validateSession(user.email);
      if (!isValid) {
        logout('Sessão invalidada por administrador');
      }
    };

    // Verificar imediatamente
    checkSession();

    // Verificar a cada 30 segundos
    const interval = setInterval(checkSession, 30000);
    
    return () => clearInterval(interval);
  }, [user?.email, sessionManager]);

  useEffect(() => {
    console.log('Verificando usuário salvo...');
    
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log('Usuário encontrado:', parsedUser.email);
          
          // Verificar se sessão ainda é válida
          const isValid = await sessionManager.validateSession(parsedUser.email);
          if (isValid) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem('auth_user');
            console.log('Sessão inválida, usuário deslogado');
          }
        } catch (error) {
          console.error('Erro ao recuperar usuário:', error);
          localStorage.removeItem('auth_user');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, [sessionManager]);

  return (
    <AuthContext.Provider value={{ user, logout, isLoading, signIn }}>
      {children}
      
      <InactivityModal
        isOpen={isWarningShown}
        timeUntilExpiry={timeUntilExpiry}
        onContinue={extendSession}
        onLogout={() => forceTimeout()}
      />
      
      {forceLogoutReason && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {forceLogoutReason}
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
