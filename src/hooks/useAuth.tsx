
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateLogoutTime = async (userEmail: string) => {
    try {
      // Buscar o último log de acesso sem data de logout
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
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, logout, isLoading }}>
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
