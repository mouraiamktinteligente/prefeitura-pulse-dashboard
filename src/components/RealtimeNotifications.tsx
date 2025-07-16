import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';

export const RealtimeNotifications = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.email) return;

    // Listener global para mudanças importantes em tempo real
    const globalChannel = supabase
      .channel('global-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'documentos_analisados'
      }, (payload) => {
        // Notificar quando novos documentos são adicionados
        if (payload.new.status === 'concluído') {
          toast({
            title: "📄 Análise concluída",
            description: `Documento "${payload.new.nome_arquivo}" foi analisado`,
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'cadastro_clientes'
      }, (payload) => {
        // Notificar quando clientes são atualizados
        toast({
          title: "👤 Cliente atualizado",
          description: `Cliente "${payload.new.nome_completo}" foi modificado`,
        });
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'usuarios_sistema'
      }, (payload) => {
        // Notificar quando novos usuários são criados
        toast({
          title: "👥 Novo usuário",
          description: `Usuário "${payload.new.nome_completo}" foi criado`,
        });
      })
      .subscribe();

    // Listener para forçar logout (segurança)
    const securityChannel = supabase
      .channel('security-notifications')
      .on('broadcast', { event: 'force_logout' }, (payload) => {
        if (payload.payload.targetEmail === user.email) {
          toast({
            title: "🚨 Sessão encerrada",
            description: "Sua sessão foi encerrada por um administrador",
            variant: "destructive"
          });
          
          // Forçar logout
          setTimeout(() => {
            localStorage.removeItem('session_token');
            localStorage.removeItem('auth_user');
            window.location.href = '/login';
          }, 2000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
      supabase.removeChannel(securityChannel);
    };
  }, [user?.email, toast]);

  return null; // Componente apenas para efeitos colaterais
};