
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

  const registerAccessLog = async (email: string, isLogin: boolean = true) => {
    try {
      if (isLogin) {
        // Registrar login
        await supabase
          .from('logs_acesso')
          .insert({
            email_usuario: email,
            data_hora_login: new Date().toISOString(),
            ip_address: null, // Pode ser implementado se necessário
            user_agent: navigator.userAgent,
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
          await supabase
            .from('logs_acesso')
            .update({ 
              data_hora_logout: new Date().toISOString(),
              updated_at: new Date().toISOString()
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
      
      // Registrar log de acesso
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
