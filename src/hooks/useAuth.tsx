
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  logout: () => Promise<void>;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logAccess = async (userEmail: string, isLogin: boolean = true) => {
    try {
      if (isLogin) {
        // Registrar login
        await supabase
          .from('logs_acesso')
          .insert({
            email_usuario: userEmail,
            data_hora_login: new Date().toISOString(),
            ip_address: null,
            user_agent: navigator.userAgent
          });
      }
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

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Iniciando processo de login para:', email);
      
      // Tentar fazer login no Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no auth.signInWithPassword:', error);
        return { error };
      }

      console.log('Login no Auth bem-sucedido para:', email);

      // Aguardar um pouco para garantir que o JWT seja processado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar se usuário existe na tabela usuarios_sistema após login bem-sucedido
      try {
        const { data: userSystem, error: userSystemError } = await supabase
          .from('usuarios_sistema')
          .select('*')
          .eq('email', email)
          .eq('ativo', true)
          .maybeSingle();

        if (userSystemError) {
          console.error('Erro ao verificar usuário na tabela usuarios_sistema:', userSystemError);
          await supabase.auth.signOut();
          return { 
            error: { 
              message: 'Erro na verificação do usuário no sistema.' 
            } 
          };
        }

        if (!userSystem) {
          console.error('Usuário não encontrado na tabela usuarios_sistema');
          await supabase.auth.signOut();
          return { 
            error: { 
              message: 'Usuário não encontrado ou inativo no sistema. Entre em contato com o administrador.' 
            } 
          };
        }

        console.log('Usuário encontrado no sistema:', userSystem);
        // Se chegou até aqui, registrar log de acesso
        await logAccess(email);
      } catch (error) {
        console.error('Erro na verificação do usuário:', error);
        await supabase.auth.signOut();
        return { 
          error: { 
            message: 'Erro na verificação do usuário no sistema.' 
          } 
        };
      }

      return { error: null };
    } catch (error) {
      console.error('Erro geral no signIn:', error);
      return { error };
    }
  };

  const logout = async () => {
    if (user?.email) {
      await updateLogoutTime(user.email);
    }
    await supabase.auth.signOut();
  };

  useEffect(() => {
    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Sessão existente:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, logout, isLoading, signIn }}>
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
