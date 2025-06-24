
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
      
      // Fazer login no Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no auth.signInWithPassword:', error);
        return { error };
      }

      if (!data.user) {
        console.error('Login falhou: nenhum usuário retornado');
        return { error: { message: 'Login falhou' } };
      }

      console.log('Login no Auth bem-sucedido para:', email);
      console.log('Dados do usuário:', data.user);

      // Aguardar um pouco para garantir que a sessão seja estabelecida
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar se usuário existe na tabela usuarios_sistema
      try {
        console.log('Verificando usuário na tabela usuarios_sistema...');
        
        // Usar uma consulta mais simples, sem usar maybeSingle que pode causar problemas
        const { data: userSystemData, error: userSystemError } = await supabase
          .from('usuarios_sistema')
          .select('*')
          .eq('email', email)
          .eq('ativo', true);

        console.log('Resultado da consulta usuarios_sistema:', { userSystemData, userSystemError });

        if (userSystemError) {
          console.error('Erro ao verificar usuário na tabela usuarios_sistema:', userSystemError);
          await supabase.auth.signOut();
          return { 
            error: { 
              message: 'Erro na verificação do usuário no sistema: ' + userSystemError.message 
            } 
          };
        }

        if (!userSystemData || userSystemData.length === 0) {
          console.error('Usuário não encontrado na tabela usuarios_sistema');
          await supabase.auth.signOut();
          return { 
            error: { 
              message: 'Usuário não encontrado ou inativo no sistema. Entre em contato com o administrador.' 
            } 
          };
        }

        const userSystem = userSystemData[0];
        console.log('Usuário encontrado no sistema:', userSystem);
        
        // Registrar log de acesso
        await logAccess(email);
        console.log('Login concluído com sucesso');
        
        return { error: null };
      } catch (error) {
        console.error('Erro na verificação do usuário:', error);
        await supabase.auth.signOut();
        return { 
          error: { 
            message: 'Erro na verificação do usuário no sistema: ' + (error as Error).message 
          } 
        };
      }
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
    console.log('Configurando listener de autenticação...');
    
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
