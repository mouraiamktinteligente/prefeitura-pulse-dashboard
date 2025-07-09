import { useState, useCallback } from 'react';
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

  const createSession = useCallback(async (userEmail: string): Promise<string | null> => {
    try {
      // Invalidar sessões antigas do usuário
      await supabase
        .from('sessoes_ativas')
        .update({ ativo: false })
        .eq('user_email', userEmail)
        .eq('ativo', true);

      // Criar nova sessão
      const { data, error } = await supabase
        .from('sessoes_ativas')
        .insert({
          user_email: userEmail,
          last_activity: new Date().toISOString(),
          expires_at: new Date(Date.now() + 20 * 60 * 1000).toISOString() // 20 minutos
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar sessão:', error);
        return null;
      }

      setCurrentSession(data);
      localStorage.setItem('session_token', data.session_token);
      return data.session_token;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      return null;
    }
  }, []);

  const validateSession = useCallback(async (userEmail: string, retryCount: number = 0): Promise<boolean> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) {
        console.log('validateSession: Nenhum token encontrado');
        return false;
      }

      console.log('validateSession: Validando sessão para:', userEmail);

      const { data, error } = await supabase
        .from('sessoes_ativas')
        .select('*')
        .eq('user_email', userEmail)
        .eq('session_token', sessionToken)
        .eq('ativo', true)
        .maybeSingle();

      if (error) {
        console.error('Erro ao validar sessão:', error);
        
        // Retry apenas uma vez para falhas temporárias de rede
        if (retryCount < 1 && error.message.includes('Load failed')) {
          console.log('validateSession: Tentando novamente...', retryCount + 1);
          await new Promise(resolve => setTimeout(resolve, 500));
          return validateSession(userEmail, retryCount + 1);
        }
        
        // Forçar logout em qualquer erro após retry
        console.log('validateSession: Erro persistente, invalidando sessão');
        return false;
      }

      if (!data) {
        console.log('validateSession: Sessão não encontrada ou inativa na base de dados');
        localStorage.removeItem('session_token');
        return false;
      }

      // Verificar se sessão expirou
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now > expiresAt) {
        console.log('validateSession: Sessão expirada');
        await invalidateSession(userEmail);
        return false;
      }

      console.log('validateSession: Sessão válida');
      setCurrentSession(data);
      return true;
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      
      // Apenas um retry para exceções
      if (retryCount < 1) {
        console.log('validateSession: Erro capturado, tentando novamente...', retryCount + 1);
        await new Promise(resolve => setTimeout(resolve, 500));
        return validateSession(userEmail, retryCount + 1);
      }
      
      // Forçar logout após erro
      console.log('validateSession: Invalidando sessão após erro persistente');
      return false;
    }
  }, []);

  const updateActivity = useCallback(async (userEmail: string): Promise<void> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) return;

      const newExpiresAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('sessoes_ativas')
        .update({
          last_activity: new Date().toISOString(),
          expires_at: newExpiresAt
        })
        .eq('user_email', userEmail)
        .eq('session_token', sessionToken)
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao atualizar atividade:', error);
      }
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
    }
  }, []);

  const invalidateSession = useCallback(async (userEmail: string): Promise<void> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      
      if (sessionToken) {
        await supabase
          .from('sessoes_ativas')
          .update({ ativo: false })
          .eq('user_email', userEmail)
          .eq('session_token', sessionToken);
      }

      localStorage.removeItem('session_token');
      setCurrentSession(null);
    } catch (error) {
      console.error('Erro ao invalidar sessão:', error);
    }
  }, []);

  const disconnectUserByAdmin = useCallback(async (targetEmail: string): Promise<boolean> => {
    try {
      // Invalidar TODAS as sessões do usuário alvo
      const { error } = await supabase
        .from('sessoes_ativas')
        .update({ 
          ativo: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_email', targetEmail)
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao desconectar usuário:', error);
        toast({
          title: "Erro",
          description: "Não foi possível desconectar o usuário.",
          variant: "destructive"
        });
        return false;
      }

      // Emitir evento realtime para forçar desconexão imediata
      const channel = supabase.channel('admin-disconnect');
      await channel.send({
        type: 'broadcast',
        event: 'user_disconnected',
        payload: { targetEmail, disconnectedAt: new Date().toISOString() }
      });

      toast({
        title: "Sucesso",
        description: "Usuário desconectado com sucesso."
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

  return {
    currentSession,
    createSession,
    validateSession,
    updateActivity,
    invalidateSession,
    disconnectUserByAdmin,
    getActiveUsers
  };
};