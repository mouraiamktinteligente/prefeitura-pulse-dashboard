import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: any | null;
  logout: () => Promise<void>;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Função para obter data/hora no timezone de São Paulo
  const getBrazilDateTime = (): string => {
    const now = new Date();
    // Converte para o timezone de São Paulo (UTC-3)
    const brazilTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
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

  const logout = async () => {
    const currentUser = user;
    setUser(null);
    localStorage.removeItem('auth_user');
    
    // Registrar logout se houver usuário logado
    if (currentUser?.email) {
      await registerAccessLog(currentUser.email, false);
    }
  };

  useEffect(() => {
    console.log('Verificando usuário salvo...');
    
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Usuário encontrado:', parsedUser.email);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao recuperar usuário:', error);
        localStorage.removeItem('auth_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, logout, isLoading, signIn }}>
      {children}
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
