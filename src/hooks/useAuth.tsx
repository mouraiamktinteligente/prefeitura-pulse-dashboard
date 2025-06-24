
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from "@/integrations/supabase/client";
import bcrypt from 'bcryptjs';

interface AuthContextType {
  user: any | null;
  logout: () => Promise<void>;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  setFirstPassword: (email: string, newPassword: string) => Promise<{ error: any }>;
  checkFirstAccess: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logAccess = async (userEmail: string) => {
    try {
      console.log('Registrando log de acesso para:', userEmail);
      await supabase
        .from('logs_acesso')
        .insert({
          email_usuario: userEmail,
          data_hora_login: new Date().toISOString(),
          ip_address: null,
          user_agent: navigator.userAgent
        });
      console.log('Log de acesso registrado com sucesso');
    } catch (error) {
      console.error('Erro ao registrar log de acesso:', error);
    }
  };

  const updateLogoutTime = async (userEmail: string) => {
    try {
      const { data: logs } = await supabase
        .from('logs_acesso')
        .select('id')
        .eq('email_usuario', userEmail)
        .is('data_hora_logout', null)
        .order('data_hora_login', { ascending: false })
        .limit(1);

      if (logs && logs.length > 0) {
        await supabase
          .from('logs_acesso')
          .update({ data_hora_logout: new Date().toISOString() })
          .eq('id', logs[0].id);
      }
    } catch (error) {
      console.error('Erro ao atualizar log de logout:', error);
    }
  };

  const checkFirstAccess = async (email: string): Promise<boolean> => {
    try {
      const { data: userData, error } = await supabase
        .from('usuarios_sistema')
        .select('senha_hash')
        .eq('email', email)
        .eq('ativo', true)
        .maybeSingle();

      if (error || !userData) {
        return false;
      }

      // Se não tem senha_hash, é primeiro acesso
      return !userData.senha_hash;
    } catch (error) {
      console.error('Erro ao verificar primeiro acesso:', error);
      return false;
    }
  };

  const setFirstPassword = async (email: string, newPassword: string) => {
    try {
      console.log('Definindo primeira senha para:', email);
      
      // Gerar hash da senha
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Atualizar senha no banco
      const { error } = await supabase
        .from('usuarios_sistema')
        .update({ senha_hash: hashedPassword })
        .eq('email', email);

      if (error) {
        console.error('Erro ao definir primeira senha:', error);
        return { error: { message: 'Erro ao definir senha' } };
      }

      console.log('Primeira senha definida com sucesso');
      return { error: null };
    } catch (error) {
      console.error('Erro geral ao definir primeira senha:', error);
      return { error: { message: 'Erro inesperado ao definir senha' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Iniciando processo de login para:', email);
      
      // Verificar se existe usuário ativo
      const { data: userData, error: userError } = await supabase
        .from('usuarios_sistema')
        .select('*')
        .eq('email', email)
        .eq('ativo', true)
        .maybeSingle();

      if (userError) {
        console.error('Erro ao verificar usuário:', userError);
        return { error: { message: 'Erro ao verificar usuário no sistema' } };
      }

      if (!userData) {
        console.error('Usuário não encontrado ou inativo');
        return { error: { message: 'Usuário não encontrado ou inativo no sistema' } };
      }

      // Verificar se é primeiro acesso
      if (!userData.senha_hash) {
        return { error: { message: 'FIRST_ACCESS', user: userData } };
      }

      // Verificar senha com hash
      const isPasswordValid = await bcrypt.compare(password, userData.senha_hash);
      if (!isPasswordValid) {
        console.error('Senha incorreta');
        return { error: { message: 'E-mail ou senha incorretos' } };
      }

      console.log('Usuário autenticado:', userData);
      
      // Simular objeto de usuário
      const simulatedUser = {
        id: userData.id,
        email: userData.email,
        user_metadata: {
          nome_completo: userData.nome_completo,
          tipo_usuario: userData.tipo_usuario,
          permissoes: userData.permissoes
        }
      };

      setUser(simulatedUser);
      
      // Salvar no localStorage para persistência
      localStorage.setItem('auth_user', JSON.stringify(simulatedUser));
      
      // Registrar log de acesso
      await logAccess(email);
      console.log('Login concluído com sucesso');
      
      return { error: null };
    } catch (error) {
      console.error('Erro geral no signIn:', error);
      return { error: { message: 'Erro inesperado no login' } };
    }
  };

  const logout = async () => {
    if (user?.email) {
      await updateLogoutTime(user.email);
    }
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  useEffect(() => {
    console.log('Verificando sessão existente...');
    
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Usuário encontrado no localStorage:', parsedUser.email);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao recuperar usuário do localStorage:', error);
        localStorage.removeItem('auth_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, logout, isLoading, signIn, setFirstPassword, checkFirstAccess }}>
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
